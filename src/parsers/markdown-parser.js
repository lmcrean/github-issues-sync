const fm = require('front-matter');

function parseMarkdownIssue(issueContent) {
  const parsed = fm(issueContent.body || issueContent);
  
  // Extract title from content (first # heading)
  const titleMatch = parsed.body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Issue';
  
  // Remove the title from body content and clean up
  let bodyContent = parsed.body.replace(/^#\s+.+$/m, '').trim();
  
  // Remove comments section for GitHub API (we'll handle comments separately)
  bodyContent = bodyContent.replace(/## Comments\n\n[\s\S]*$/, '').trim();
  
  return {
    title,
    body: bodyContent,
    github_id: parsed.attributes.github_id,
    status: parsed.attributes.status || 'open',
    labels: Array.isArray(parsed.attributes.labels) ? parsed.attributes.labels : [],
    assignees: Array.isArray(parsed.attributes.assignees) ? parsed.attributes.assignees : [],
    created_at: parsed.attributes.created_at,
    updated_at: parsed.attributes.updated_at,
    author: parsed.attributes.author,
    milestone: parsed.attributes.milestone,
    url: parsed.attributes.url
  };
}

module.exports = { parseMarkdownIssue };
