const path = require('path');
const { writeIssueFile, ensureDirectoryExists } = require('../utils/file-utils');
const { logger } = require('../utils/logger');

async function createConflictFile(originalPath, existingContent, newData) {
  const conflictsDir = '.conflicts';
  await ensureDirectoryExists(conflictsDir);
  
  const fileName = path.basename(originalPath, '.md');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create conflict files
  const localPath = path.join(conflictsDir, `${fileName}-local-${timestamp}.md`);
  const remotePath = path.join(conflictsDir, `${fileName}-remote-${timestamp}.md`);
  
  await writeIssueFile(localPath, {
    frontMatter: existingContent.attributes,
    content: existingContent.body
  });
  
  await writeIssueFile(remotePath, newData);
  
  // Create conflict resolution file
  const resolutionPath = path.join(conflictsDir, `${fileName}-resolution-${timestamp}.md`);
  const resolutionContent = createResolutionTemplate(originalPath, localPath, remotePath);
  
  const fs = require('fs-extra');
  await fs.writeFile(resolutionPath, resolutionContent);
  
  logger.warn(`Conflict detected in ${originalPath}. Resolution files created in ${conflictsDir}/`);
  logger.info(`- Local version: ${localPath}`);
  logger.info(`- Remote version: ${remotePath}`);
  logger.info(`- Resolution template: ${resolutionPath}`);
}

function createResolutionTemplate(originalPath, localPath, remotePath) {
  const resolutionFileName = path.basename(__filename);
  
  return `# Conflict Resolution for ${originalPath}

A conflict was detected when syncing this issue. The remote version on GitHub has been updated more recently than the local file, but the content differs.

## Files
- **Original**: \`${originalPath}\`
- **Local version**: \`${localPath}\`
- **Remote version**: \`${remotePath}\`

## Resolution Options

### Option 1: Keep Local Version
\`\`\`bash
cp "${localPath}" "${originalPath}"
\`\`\`

### Option 2: Keep Remote Version
\`\`\`bash
cp "${remotePath}" "${originalPath}"
\`\`\`

### Option 3: Manual Merge
Edit \`${originalPath}\` manually to combine both versions.

## Conflict Details
- **Local file**: Contains your local changes
- **Remote file**: Contains the latest version from GitHub
- **Recommended**: Review both versions and manually merge the important changes

## Next Steps
1. Choose your resolution method above
2. Update the original file: \`${originalPath}\`
3. Delete these conflict files:
   - \`${localPath}\`
   - \`${remotePath}\`
   - \`${path.basename(resolutionFileName)}\`
4. Commit your changes
5. Re-run the sync action

---
*Generated on ${new Date().toISOString()}*
`;
}

module.exports = { createConflictFile };
