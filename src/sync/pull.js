const { getGitHubApi } = require('../utils/github-api');
const { parseGitHubIssue } = require('../parsers/github-parser');
const { writeIssueFile, readIssueFile, ensureDirectoryExists } = require('../utils/file-utils');
const { createConflictFile } = require('./conflict-resolver');
const { logger } = require('../utils/logger');
const path = require('path');

async function syncPull({ token, issuesPath, conflictStrategy }) {
  const github = getGitHubApi(token);
  let syncedCount = 0;
  let conflictsCount = 0;
  
  try {
    // Get repository context
    const context = require('@actions/github').context;
    const { owner, repo } = context.repo;
    
    logger.info(`Fetching issues from ${owner}/${repo}`);
    
    // Fetch all issues (open and closed)
    const issues = await github.paginate(github.rest.issues.listForRepo, {
      owner,
      repo,
      state: 'all',
      sort: 'created',
      direction: 'desc'
    });
    
    logger.info(`Found ${issues.length} issues to sync`);
    
    // Ensure directories exist
    await ensureDirectoryExists(path.join(issuesPath, 'open'));
    await ensureDirectoryExists(path.join(issuesPath, 'closed'));
    
    for (const issue of issues) {
      try {
        // Skip pull requests (they're returned by the issues API)
        if (issue.pull_request) {
          logger.debug(`Skipping pull request #${issue.number}`);
          continue;
        }
        
        const issueData = await parseGitHubIssue(issue, github, owner, repo);
        const fileName = `${issue.number}-${slugify(issue.title)}.md`;
        const subDir = issue.state === 'open' ? 'open' : 'closed';
        const filePath = path.join(issuesPath, subDir, fileName);
        
        // Check if file already exists
        const existingContent = await readIssueFile(filePath);
        
        if (existingContent) {
          // Check for conflicts
          const conflict = detectConflict(existingContent, issueData);
          if (conflict) {
            conflictsCount++;
            await handleConflict(filePath, existingContent, issueData, conflictStrategy);
            continue;
          }
        }
        
        await writeIssueFile(filePath, issueData);
        syncedCount++;
        logger.debug(`Synced issue #${issue.number}: ${issue.title}`);
        
      } catch (error) {
        logger.error(`Failed to sync issue #${issue.number}: ${error.message}`);
        logger.debug(`Error details: ${error.stack}`);
      }
    }
    
    logger.info(`Pull sync completed: ${syncedCount} synced, ${conflictsCount} conflicts`);
    
  } catch (error) {
    logger.error(`Pull sync failed: ${error.message}`);
    throw error;
  }
  
  return { synced: syncedCount, conflicts: conflictsCount };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function detectConflict(existingContent, newData) {
  // Simple conflict detection - check if GitHub updated_at is newer than local
  const existingMeta = existingContent.attributes;
  const newUpdatedAt = new Date(newData.frontMatter.updated_at);
  const existingUpdatedAt = new Date(existingMeta.updated_at || existingMeta.created_at);
  
  // Check if GitHub was updated after local file AND content differs
  const hasNewerRemote = newUpdatedAt > existingUpdatedAt;
  const hasContentDiff = existingContent.body.trim() !== newData.content.trim();
  
  return hasNewerRemote && hasContentDiff;
}

async function handleConflict(filePath, existingContent, newData, strategy) {
  switch (strategy) {
    case 'fail':
      throw new Error(`Conflict detected in ${filePath}. Remote version is newer but local content differs.`);
    case 'overwrite':
      logger.warn(`Overwriting local file: ${filePath}`);
      await writeIssueFile(filePath, newData);
      break;
    case 'create-files':
    default:
      logger.warn(`Creating conflict files for: ${filePath}`);
      await createConflictFile(filePath, existingContent, newData);
      break;
  }
}

module.exports = { syncPull };
