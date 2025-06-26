const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// Demo setup to show how the action works
async function setupDemo() {
  console.log('🎬 Setting up GitHub Issues Sync demo...');
  
  // Create sample issue files to demonstrate the sync functionality
  const issuesPath = '.github/issues';
  
  // Ensure directories exist
  await fs.ensureDir(path.join(issuesPath, 'open'));
  await fs.ensureDir(path.join(issuesPath, 'closed'));
  
  // Sample open issue
  const openIssue = {
    frontMatter: {
      github_id: null, // Will be populated when pushed to GitHub
      status: 'open',
      labels: ['bug', 'high-priority'],
      assignees: ['developer1'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'local-user',
      milestone: 'v2.0',
      url: null
    },
    content: `# Fix login validation bug

The login form is not properly validating email addresses, allowing invalid formats to pass through.

## Steps to Reproduce
1. Go to login page
2. Enter invalid email format (e.g., "test@")
3. Click submit
4. Form accepts invalid input

## Expected Behavior
Form should reject invalid email formats and show error message.

## Additional Context
This affects user experience and data quality.`
  };
  
  // Sample closed issue
  const closedIssue = {
    frontMatter: {
      github_id: 42,
      status: 'closed',
      labels: ['enhancement', 'documentation'],
      assignees: [],
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T15:45:00Z',
      author: 'github-user',
      milestone: 'v1.5',
      url: 'https://github.com/example/repo/issues/42'
    },
    content: `# Update API documentation

Update the API documentation to include new authentication endpoints.

## Tasks
- [x] Document OAuth2 flow
- [x] Add code examples
- [x] Update postman collection

## Comments

### @reviewer1 - 1/18/2024 2:30:00 PM

Looks good! Just need to add rate limiting info.

### @github-user - 1/20/2024 3:45:00 PM

Added rate limiting documentation as requested.`
  };
  
  // Write sample files
  await writeIssueFile(path.join(issuesPath, 'open', '1-fix-login-validation-bug.md'), openIssue);
  await writeIssueFile(path.join(issuesPath, 'closed', '42-update-api-documentation.md'), closedIssue);
  
  console.log('✅ Demo files created:');
  console.log('  - .github/issues/open/1-fix-login-validation-bug.md');
  console.log('  - .github/issues/closed/42-update-api-documentation.md');
  
  // Create a sample workflow file
  const workflowContent = `name: Sync GitHub Issues
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger
  issues:
    types: [opened, edited, closed, reopened]

jobs:
  sync-issues:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Sync GitHub Issues
        uses: ./
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          sync-direction: 'both'
          issues-path: '.github/issues'
          conflict-strategy: 'create-files'
          debug: 'false'
`;

  await fs.ensureDir('.github/workflows');
  await fs.writeFile('.github/workflows/sync-issues.yml', workflowContent);
  console.log('✅ Sample workflow created: .github/workflows/sync-issues.yml');
  
  console.log('\n🎯 The GitHub Issues Sync Action is ready!');
  console.log('\nIn a real GitHub repository, this action would:');
  console.log('  📥 Pull: Download GitHub issues → Create/update local markdown files');
  console.log('  📤 Push: Read local markdown files → Create/update GitHub issues');
  console.log('  ⚡ Conflict Resolution: Handle differences between local and remote versions');
  console.log('  📁 Organization: Automatically sort issues into open/ and closed/ folders');
  
  console.log('\nKey Features Demonstrated:');
  console.log('  ✓ YAML frontmatter with complete issue metadata');
  console.log('  ✓ Structured markdown content with comments');
  console.log('  ✓ Support for labels, assignees, milestones');
  console.log('  ✓ Bidirectional synchronization capability');
  console.log('  ✓ Organized file structure');
}

async function writeIssueFile(filePath, issueData) {
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
  await fs.ensureDir(path.dirname(filePath));
  
  // Write file
  await fs.writeFile(filePath, fileContent, 'utf8');
}

// Run the demo
setupDemo().catch(console.error);