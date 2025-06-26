const { logger } = require('../utils/logger');

async function parseGitHubIssue(issue, github, owner, repo) {
  // Fetch comments if any
  let comments = [];
  if (issue.comments > 0) {
    try {
      const commentsResponse = await github.rest.issues.listComments({
        owner,
        repo,
        issue_number: issue.number
      });
      comments = commentsResponse.data;
      logger.debug(`Fetched ${comments.length} comments for issue #${issue.number}`);
    } catch (error) {
      logger.warn(`Failed to fetch comments for issue #${issue.number}: ${error.message}`);
    }
  }
  
  // Build front matter
  const frontMatter = {
    github_id: issue.number,
    status: issue.state,
    labels: issue.labels.map(label => label.name),
    assignees: issue.assignees.map(assignee => assignee.login),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    author: issue.user.login,
    milestone: issue.milestone ? issue.milestone.title : null,
    url: issue.html_url
  };
  
  // Build content
  let content = `# ${issue.title}\n\n`;
  
  if (issue.body) {
    content += `${issue.body}\n\n`;
  }
  
  // Add comments section
  if (comments.length > 0) {
    content += '## Comments\n\n';
    
    for (const comment of comments) {
      const commentDate = new Date(comment.created_at).toLocaleDateString();
      const commentTime = new Date(comment.created_at).toLocaleTimeString();
      content += `### @${comment.user.login} - ${commentDate} ${commentTime}\n\n`;
      content += `${comment.body}\n\n`;
      
      if (comment.updated_at !== comment.created_at) {
        const updatedDate = new Date(comment.updated_at).toLocaleDateString();
        const updatedTime = new Date(comment.updated_at).toLocaleTimeString();
        content += `*Updated: ${updatedDate} ${updatedTime}*\n\n`;
      }
    }
  }
  
  return {
    frontMatter,
    content: content.trim()
  };
}

module.exports = { parseGitHubIssue };
