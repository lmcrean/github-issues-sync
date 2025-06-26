const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { logger } = require('./logger');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.ensureDir(dirPath);
    logger.debug(`Ensured directory exists: ${dirPath}`);
  } catch (error) {
    logger.error(`Failed to create directory ${dirPath}: ${error.message}`);
    throw error;
  }
}

async function writeIssueFile(filePath, issueData) {
  try {
    const { frontMatter, content } = issueData;
    
    // Clean up front matter - remove null/undefined values
    const cleanFrontMatter = Object.fromEntries(
      Object.entries(frontMatter).filter(([_, value]) => value !== null && value !== undefined)
    );
    
    // Format front matter as YAML
    const yamlFrontMatter = yaml.dump(cleanFrontMatter, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: true
    });
    
    // Combine front matter and content
    const fileContent = `---\n${yamlFrontMatter}---\n\n${content}`;
    
    // Ensure directory exists
    await ensureDirectoryExists(path.dirname(filePath));
    
    // Write file
    await fs.writeFile(filePath, fileContent, 'utf8');
    logger.debug(`Wrote issue file: ${filePath}`);
    
  } catch (error) {
    logger.error(`Failed to write issue file ${filePath}: ${error.message}`);
    throw error;
  }
}

async function readIssueFile(filePath) {
  try {
    if (!await fs.pathExists(filePath)) {
      logger.debug(`File does not exist: ${filePath}`);
      return null;
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const fm = require('front-matter');
    const parsed = fm(content);
    
    logger.debug(`Read issue file: ${filePath}`);
    return parsed;
    
  } catch (error) {
    logger.error(`Failed to read issue file ${filePath}: ${error.message}`);
    return null;
  }
}

async function getAllIssueFiles(issuesPath) {
  const issueFiles = [];
  
  try {
    const openDir = path.join(issuesPath, 'open');
    const closedDir = path.join(issuesPath, 'closed');
    
    // Check if directories exist and read files
    if (await fs.pathExists(openDir)) {
      const openFiles = await fs.readdir(openDir);
      const openMarkdownFiles = openFiles
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(openDir, file));
      issueFiles.push(...openMarkdownFiles);
      logger.debug(`Found ${openMarkdownFiles.length} open issue files`);
    }
    
    if (await fs.pathExists(closedDir)) {
      const closedFiles = await fs.readdir(closedDir);
      const closedMarkdownFiles = closedFiles
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(closedDir, file));
      issueFiles.push(...closedMarkdownFiles);
      logger.debug(`Found ${closedMarkdownFiles.length} closed issue files`);
    }
    
    // Also check root issues directory for legacy files
    if (await fs.pathExists(issuesPath)) {
      const rootFiles = await fs.readdir(issuesPath);
      const rootMarkdownFiles = rootFiles
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(issuesPath, file));
      issueFiles.push(...rootMarkdownFiles);
      logger.debug(`Found ${rootMarkdownFiles.length} root issue files`);
    }
    
  } catch (error) {
    logger.error(`Failed to get issue files from ${issuesPath}: ${error.message}`);
    throw error;
  }
  
  logger.info(`Total issue files found: ${issueFiles.length}`);
  return issueFiles;
}

module.exports = {
  ensureDirectoryExists,
  writeIssueFile,
  readIssueFile,
  getAllIssueFiles
};
