const path = require('path');

function validateInputs(inputs) {
  const errors = [];
  
  // Validate GitHub token
  if (!inputs.token) {
    errors.push('GitHub token is required');
  }
  
  // Validate sync direction
  const validDirections = ['pull', 'push', 'both'];
  if (!validDirections.includes(inputs.direction)) {
    errors.push(`Invalid sync direction: ${inputs.direction}. Must be one of: ${validDirections.join(', ')}`);
  }
  
  // Validate conflict strategy
  const validStrategies = ['fail', 'create-files', 'overwrite'];
  if (!validStrategies.includes(inputs.conflictStrategy)) {
    errors.push(`Invalid conflict strategy: ${inputs.conflictStrategy}. Must be one of: ${validStrategies.join(', ')}`);
  }
  
  // Validate issues path
  if (!inputs.issuesPath || typeof inputs.issuesPath !== 'string') {
    errors.push('Issues path must be a valid string');
  } else {
    // Check if path is safe (no traversal attacks)
    const normalizedPath = path.normalize(inputs.issuesPath);
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      errors.push('Issues path must be a relative path without parent directory references');
    }
  }
  
  // Throw consolidated error if any validation failed
  if (errors.length > 0) {
    throw new Error(`Input validation failed:\n- ${errors.join('\n- ')}`);
  }
  
  return true;
}

function validateIssueData(issueData) {
  const errors = [];
  
  if (!issueData.title || typeof issueData.title !== 'string' || issueData.title.trim().length === 0) {
    errors.push('Issue title is required and must be a non-empty string');
  }
  
  if (issueData.labels && !Array.isArray(issueData.labels)) {
    errors.push('Labels must be an array');
  }
  
  if (issueData.assignees && !Array.isArray(issueData.assignees)) {
    errors.push('Assignees must be an array');
  }
  
  if (issueData.status && !['open', 'closed'].includes(issueData.status)) {
    errors.push('Status must be either "open" or "closed"');
  }
  
  if (errors.length > 0) {
    throw new Error(`Issue data validation failed:\n- ${errors.join('\n- ')}`);
  }
  
  return true;
}

module.exports = { validateInputs, validateIssueData };
