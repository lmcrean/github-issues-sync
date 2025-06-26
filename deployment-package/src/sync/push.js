const { getGitHubApi } = require('../utils/github-api');
const { parseMarkdownIssue } = require('../parsers/markdown-parser');
const { readIssueFile, getAllIssueFiles, writeIssueFile } = require('../utils/file-utils');
const { createConflictFile } = require('./conflict-resolver');
const { logger } = require('../utils/logger');

async function syncPush({ token, issuesPath, conflictStrategy }) {
  const github = getGitHubApi(token);
  let syncedCount = 0;
  let conflictsCount = 0;
  
  try {
    const context = require('@actions/github').context;
    const { owner, repo } = context.repo;
    
    logger.info(`Pushing local issues to ${owner}/${repo}`);
    
    // Get all local issue files
    const issueFiles = await getAllIssueFiles(issuesPath);
    logger.info(`Found ${issueFiles.length} local issue files`);
    
    for (const filePath of issueFiles) {
      try {
        const issueContent = await readIssueFile(filePath);
        if (!issueContent) continue;
        
        const issueData = parseMarkdownIssue(issueContent);
        
        if (issueData.github_id) {
          // Update existing issue
          logger.debug(`Updating existing issue #${issueData.github_id}: ${issueData.title}`);
          await updateGitHubIssue(github, owner, repo, issueData);
        } else {
          // Create new issue
          logger.debug(`Creating new issue: ${issueData.title}`);
          const newIssue = await createGitHubIssue(github, owner, repo, issueData);
          
          // Update local file with GitHub ID
          issueContent.attributes.github_id = newIssue.number;
          issueContent.attributes.url = newIssue.html_url;
          issueContent.attributes.created_at = newIssue.created_at;
          issueContent.attributes.updated_at = newIssue.updated_at;
          
          await writeIssueFile(filePath, {
            frontMatter: issueContent.attributes,
            content: issueContent.body
          });
        }
        
        syncedCount++;
        logger.debug(`Pushed issue: ${issueData.title}`);
        
      } catch (error) {
        logger.error(`Failed to push issue from ${filePath}: ${error.message}`);
        logger.debug(`Error details: ${error.stack}`);
      }
    }
    
    logger.info(`Push sync completed: ${syncedCount} synced, ${conflictsCount} conflicts`);
    
  } catch (error) {
    logger.error(`Push sync failed: ${error.message}`);
    throw error;
  }
  
  return { synced: syncedCount, conflicts: conflictsCount };
}

async function createGitHubIssue(github, owner, repo, issueData) {
  const createParams = {
    owner,
    repo,
    title: issueData.title,
    body: issueData.body || '',
    labels: issueData.labels || [],
    assignees: issueData.assignees || []
  };

  // Handle milestone if specified
  if (issueData.milestone) {
    const milestoneNumber = await getMilestoneNumber(github, owner, repo, issueData.milestone);
    if (milestoneNumber) {
      createParams.milestone = milestoneNumber;
    }
  }

  const response = await github.rest.issues.create(createParams);
  return response.data;
}

async function updateGitHubIssue(github, owner, repo, issueData) {
  const updateParams = {
    owner,
    repo,
    issue_number: issueData.github_id,
    title: issueData.title,
    body: issueData.body || '',
    labels: issueData.labels || [],
    assignees: issueData.assignees || [],
    state: issueData.status || 'open'
  };

  // Handle milestone if specified
  if (issueData.milestone) {
    const milestoneNumber = await getMilestoneNumber(github, owner, repo, issueData.milestone);
    if (milestoneNumber) {
      updateParams.milestone = milestoneNumber;
    }
  }

  const response = await github.rest.issues.update(updateParams);
  return response.data;
}

async function getMilestoneNumber(github, owner, repo, milestoneTitle) {
  try {
    const milestones = await github.rest.issues.listMilestones({
      owner,
      repo,
      state: 'all'
    });
    
    const milestone = milestones.data.find(m => m.title === milestoneTitle);
    return milestone ? milestone.number : undefined;
  } catch (error) {
    logger.warn(`Could not find milestone "${milestoneTitle}": ${error.message}`);
    return undefined;
  }
}

module.exports = { syncPush };
