# Quick Start - Add to Your GitHub Repository

## Step 1: Download and Add Files

1. **Copy all files** from this deployment package to your GitHub repository
2. **Maintain the directory structure** exactly as shown

## Step 2: Simple Setup Commands

Run these commands in your repository:

```bash
# If starting fresh
git clone your-repo-url
cd your-repo

# Copy the action files (adjust paths as needed)
# Copy src/ folder to repository root
# Copy action.yml to repository root  
# Copy package.json to repository root
# Copy .github/ folder to repository root

# Commit the changes
git add .
git commit -m "Add GitHub Issues Sync Action"
git push
```

## Step 3: Enable the Action

The action will automatically:
- Run every 6 hours
- Trigger when issues are created/modified
- Can be manually triggered from GitHub Actions tab

## Step 4: Verify It's Working

1. Go to **Actions** tab in your GitHub repository
2. Look for **"Sync GitHub Issues"** workflow
3. Click **"Run workflow"** to test manually
4. Check the **".github/issues/"** folder for synced issues

## What Happens Next

- **Pull Sync**: Downloads your GitHub issues as markdown files
- **Push Sync**: Creates GitHub issues from local markdown files  
- **File Organization**: Issues sorted into `open/` and `closed/` folders
- **Conflict Handling**: Automatic resolution when local and remote differ

## Example File Structure After First Run

```
your-repo/
├── .github/
│   ├── issues/
│   │   ├── open/
│   │   │   ├── 1-bug-report.md
│   │   │   └── 3-feature-request.md
│   │   └── closed/
│   │       └── 2-fixed-issue.md
│   └── workflows/
│       └── sync-issues.yml
├── action.yml
├── package.json
└── src/ (action code)
```

## Need Help?

- Check the **Actions** logs for detailed information
- Review **README.md** for complete documentation
- Issues are stored as markdown files with metadata headers