# GitHub Issues Sync Action

A GitHub Action for bidirectional synchronization between GitHub issues and local markdown files with intelligent conflict resolution.

## Features

- **Bidirectional Sync**: Pull issues from GitHub to local files, push local files to GitHub, or both
- **Markdown Format**: Issues stored as structured markdown files with YAML frontmatter
- **Complete Metadata**: Preserves labels, assignees, milestones, status, and comments
- **Conflict Resolution**: Multiple strategies for handling conflicts between local and remote versions
- **Organized Structure**: Automatically organizes issues into `open/` and `closed/` subdirectories
- **Comprehensive Logging**: Detailed logging with debug mode support

## Quick Start

### 1. Add to Your Repository

Create `.github/workflows/sync-issues.yml`:

```yaml
name: Sync GitHub Issues
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
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sync-direction: 'both'
          issues-path: '.github/issues'
          conflict-strategy: 'create-files'
```

### 2. File Structure

After running, your repository will have:

```
.github/issues/
├── open/
│   ├── 1-fix-login-validation-bug.md
│   └── 3-add-dark-mode-support.md
└── closed/
    └── 2-update-documentation.md
```

### 3. Issue File Format

Each issue is stored as a markdown file with YAML frontmatter:

```yaml
---
assignees:
  - developer1
author: github-user
created_at: '2024-01-15T10:30:00Z'
github_id: 42
labels:
  - bug
  - high-priority
milestone: v2.0
status: open
updated_at: '2024-01-20T15:45:00Z'
url: https://github.com/owner/repo/issues/42
---

# Fix login validation bug

The login form is not properly validating email addresses.

## Steps to Reproduce
1. Go to login page
2. Enter invalid email format
3. Form accepts invalid input

## Comments

### @reviewer1 - 1/18/2024 2:30:00 PM

This needs to be fixed before release.
```

## Configuration

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for API access | Yes | `${{ github.token }}` |
| `sync-direction` | Direction to sync (`pull`, `push`, or `both`) | No | `both` |
| `issues-path` | Path to issues directory | No | `.github/issues` |
| `conflict-strategy` | How to handle conflicts (`fail`, `create-files`, or `overwrite`) | No | `create-files` |
| `debug` | Enable debug logging | No | `false` |

### Outputs

| Output | Description |
|--------|-------------|
| `synced-count` | Number of issues synced |
| `conflicts-count` | Number of conflicts detected |

## Sync Strategies

### Pull Sync (GitHub → Local)
- Downloads all issues from GitHub
- Creates/updates local markdown files
- Preserves existing local changes with conflict resolution
- Organizes files into `open/` and `closed/` directories

### Push Sync (Local → GitHub)
- Reads local markdown files
- Creates new GitHub issues for files without `github_id`
- Updates existing GitHub issues
- Syncs back GitHub-generated metadata

### Conflict Resolution

When conflicts occur during pull sync:

1. **`fail`**: Stop execution and report error
2. **`create-files`** (default): Create conflict resolution files in `.conflicts/`
3. **`overwrite`**: Replace local files with GitHub versions

Conflict files include:
- `filename-local-timestamp.md`: Your local version
- `filename-remote-timestamp.md`: GitHub version
- `filename-resolution-timestamp.md`: Instructions for manual resolution

## Advanced Usage

### Selective Sync

```yaml
- name: Pull Only
  uses: ./
  with:
    sync-direction: 'pull'
    conflict-strategy: 'overwrite'

- name: Push Only
  uses: ./
  with:
    sync-direction: 'push'
```

### Custom Issues Path

```yaml
- name: Custom Location
  uses: ./
  with:
    issues-path: 'docs/issues'
```

### Debug Mode

```yaml
- name: Debug Sync
  uses: ./
  with:
    debug: 'true'
```

## Workflow Examples

### Scheduled Sync

```yaml
name: Scheduled Issue Sync
on:
  schedule:
    - cron: '0 8,20 * * *'  # 8 AM and 8 PM daily

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Event-Triggered Sync

```yaml
name: Issue Event Sync
on:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          sync-direction: 'pull'
```

## Benefits

- **Version Control**: Track issue changes in git history
- **Local Editing**: Edit issues offline with your favorite editor
- **Backup**: Maintain local copies of all issues
- **Integration**: Include issues in documentation workflows
- **Search**: Use git grep and other tools to search issues
- **Automation**: Build custom workflows around issue data

## Security

- Uses GitHub's built-in `GITHUB_TOKEN` by default
- Validates all input paths to prevent directory traversal
- No external dependencies beyond official GitHub Actions libraries
- All data stays within your repository

## Troubleshooting

### Common Issues

**Token Permissions**: Ensure your workflow has appropriate permissions:
```yaml
permissions:
  issues: write
  contents: write
```

**Conflict Resolution**: Check `.conflicts/` directory for resolution files when conflicts occur.

**Debug Information**: Enable debug mode to see detailed logs:
```yaml
with:
  debug: 'true'
```

### File Naming

Files are automatically named using the pattern:
`{issue-number}-{slugified-title}.md`

Examples:
- `1-fix-login-bug.md`
- `42-add-new-feature-request.md`
