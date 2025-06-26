# GitHub Issues Sync Action

## Overview

This project is a GitHub Action that provides bidirectional synchronization between GitHub issues and local markdown files. It allows teams to manage GitHub issues locally using markdown files with YAML frontmatter, enabling version control of issues and integration with local development workflows.

## System Architecture

### Core Architecture
- **Node.js Application**: Built on Node.js 20 runtime
- **GitHub Actions Framework**: Uses @actions/core and @actions/github for GitHub integration
- **File-based Storage**: Issues stored as markdown files with YAML frontmatter
- **Bidirectional Sync**: Supports pull (GitHub → Local), push (Local → GitHub), or both directions

### Key Design Decisions
1. **Markdown + YAML Format**: Chosen for human readability and version control compatibility
2. **Directory Organization**: Issues organized into `open/` and `closed/` subdirectories for clarity
3. **Conflict Resolution**: Multiple strategies (fail, create-files, overwrite) to handle sync conflicts
4. **Comprehensive Metadata**: Preserves all GitHub issue metadata including labels, assignees, milestones

## Key Components

### Entry Point (`src/index.js`)
- Main orchestrator that handles input validation and sync direction routing
- Manages error handling and output reporting
- Coordinates between pull and push sync operations

### Sync Operations
- **Pull Sync** (`src/sync/pull.js`): Downloads issues from GitHub to local markdown files
- **Push Sync** (`src/sync/push.js`): Uploads local markdown files to GitHub as issues
- **Conflict Resolver** (`src/sync/conflict-resolver.js`): Handles conflicts between local and remote versions

### Parsers
- **GitHub Parser** (`src/parsers/github-parser.js`): Converts GitHub API responses to markdown format
- **Markdown Parser** (`src/parsers/markdown-parser.js`): Converts markdown files to GitHub API format

### Utilities
- **File Utils** (`src/utils/file-utils.js`): File system operations and directory management
- **GitHub API** (`src/utils/github-api.js`): GitHub API client initialization
- **Logger** (`src/utils/logger.js`): Centralized logging with debug mode support
- **Validation** (`src/utils/validation.js`): Input validation and security checks

## Data Flow

### Pull Sync Flow
1. Fetch all issues from GitHub repository using REST API
2. Parse each issue into markdown format with YAML frontmatter
3. Check for existing local files and detect conflicts
4. Apply conflict resolution strategy (fail, create conflict files, or overwrite)
5. Write issues to organized directory structure (`open/` or `closed/`)

### Push Sync Flow
1. Scan local directories for markdown issue files
2. Parse markdown files to extract issue data and metadata
3. Check if issue exists on GitHub (via github_id in frontmatter)
4. Create new issues or update existing ones via GitHub API
5. Update local files with GitHub-generated metadata

### File Structure
```
.github/issues/
├── open/
│   ├── 1-issue-title.md
│   └── 2-another-issue.md
└── closed/
    └── 3-resolved-issue.md
```

## External Dependencies

### GitHub APIs
- **GitHub REST API**: Primary interface for issue management
- **GitHub Actions Framework**: Runtime environment and utilities
- **Octokit**: GitHub API client with pagination support

### Node.js Packages
- **@actions/core**: GitHub Actions toolkit for inputs/outputs
- **@actions/github**: GitHub context and API access
- **front-matter**: YAML frontmatter parsing
- **fs-extra**: Enhanced file system operations
- **js-yaml**: YAML serialization/deserialization

### Authentication
- Uses GitHub token (typically `${{ secrets.GITHUB_TOKEN }}`) for API access
- Requires repository read/write permissions for issues

## Deployment Strategy

### GitHub Actions Deployment
- Distributed as a composite GitHub Action
- Uses Node.js 20 runtime environment
- Can be triggered via schedule, workflow dispatch, or repository events
- Runs in GitHub-hosted runners (ubuntu-latest recommended)

### Configuration Options
- **Sync Direction**: pull, push, or both
- **Issues Path**: Configurable directory for issue storage
- **Conflict Strategy**: Multiple approaches for handling conflicts
- **Debug Mode**: Enhanced logging for troubleshooting

### Security Considerations
- Path traversal protection in validation layer
- Token-based authentication with minimal required permissions
- Input sanitization for all user-provided values

## Recent Changes

- June 26, 2025: Completed full GitHub Issues Sync Action implementation
  - All core synchronization functionality working
  - Bidirectional sync (pull from GitHub, push to GitHub)
  - Comprehensive conflict resolution system
  - Complete metadata preservation (labels, assignees, milestones, comments)
  - Organized file structure with open/closed directories
  - Full validation and error handling
  - Debug logging support
  - Created demo files and comprehensive documentation

## Demo Files Created

- `.github/issues/open/1-fix-login-validation-bug.md` - Sample new issue
- `.github/issues/closed/42-update-api-documentation.md` - Sample synced issue
- `.github/workflows/sync-issues.yml` - Example workflow configuration
- `demo-setup.js` - Demonstration script showing functionality

## Changelog

- June 26, 2025: Initial setup and complete implementation
- June 26, 2025: Added comprehensive documentation and demo

## User Preferences

Preferred communication style: Simple, everyday language.