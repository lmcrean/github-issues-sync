const { getOctokit } = require('@actions/github');

function getGitHubApi(token) {
  if (!token) {
    throw new Error('GitHub token is required');
  }
  
  try {
    return getOctokit(token);
  } catch (error) {
    throw new Error(`Failed to initialize GitHub API: ${error.message}`);
  }
}

module.exports = { getGitHubApi };
