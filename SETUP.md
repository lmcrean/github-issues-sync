# GitHub Issues Sync Action - Setup Guide

This guide will help you add the GitHub Issues Sync Action to your repository.

## Option 1: Use as a Composite Action (Recommended)

### Step 1: Copy Files to Your Repository

Create the following directory structure in your repository:

```
your-repo/
├── action.yml
├── package.json
├── src/
│   ├── index.js
│   ├── parsers/
│   │   ├── github-parser.js
│   │   └── markdown-parser.js
│   ├── sync/
│   │   ├── conflict-resolver.js
│   │   ├── pull.js
│   │   └── push.js
│   └── utils/
│       ├── file-utils.js
│       ├── github-api.js
│       ├── logger.js
│       └── validation.js
└── .github/
    └── workflows/
        └── sync-issues.yml
```

### Step 2: Copy the Files

1. Copy `action.yml` to your repository root
2. Copy the entire `src/` directory to your repository root
3. Copy `.github/workflows/sync-issues.yml` to your repository

### Step 3: Install Dependencies

Add this `package.json` to your repository root:

```json
{
  "name": "github-issues-sync",
  "version": "1.0.0",
  "description": "Sync GitHub issues with local markdown files",
  "main": "src/index.js",
  "dependencies": {
    "@actions/core": "^1.10.1",
    "@actions/github": "^6.0.0",
    "front-matter": "^4.0.2",
    "js-yaml": "^4.1.0",
    "fs-extra": "^11.1.1"
  },
  "license": "MIT"
}
```

### Step 4: Commit and Push

```bash
git add .
git commit -m "Add GitHub Issues Sync Action"
git push
```

## Option 2: Reference as External Action

If you want to use this action from another repository, create this workflow:

```yaml
name: Sync GitHub Issues
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:
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
        uses: your-username/github-issues-sync@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sync-direction: 'both'
          issues-path: '.github/issues'
          conflict-strategy: 'create-files'
```

## Verification

After setup, you can:

1. **Manual Trigger**: Go to Actions → Sync GitHub Issues → Run workflow
2. **Check Logs**: View the action logs to see sync results
3. **View Files**: Check `.github/issues/` for synced issue files

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your workflow has the correct permissions:
   ```yaml
   permissions:
     issues: write
     contents: write
   ```

2. **Token Issues**: The action uses `${{ secrets.GITHUB_TOKEN }}` by default, which should work automatically

3. **Node.js Version**: The action requires Node.js 20 (specified in `action.yml`)

### Getting Help

- Check the action logs for detailed error messages
- Enable debug mode by setting `debug: 'true'` in your workflow
- Review the README.md for full documentation

## Next Steps

Once the action is running:

1. Issues will be synced to `.github/issues/open/` and `.github/issues/closed/`
2. You can edit these markdown files locally
3. Changes will sync back to GitHub on the next run
4. Conflicts are handled automatically based on your strategy

The action will run automatically every 6 hours and when issues are modified.