const core = require('@actions/core');
const { syncPull } = require('./sync/pull');
const { syncPush } = require('./sync/push');
const { setupLogging } = require('./utils/logger');
const { validateInputs } = require('./utils/validation');

async function run() {
  try {
    setupLogging();
    
    const inputs = {
      direction: core.getInput('sync-direction') || 'both',
      token: core.getInput('github-token'),
      issuesPath: core.getInput('issues-path') || '.github/issues',
      conflictStrategy: core.getInput('conflict-strategy') || 'create-files',
      debug: core.getInput('debug') === 'true'
    };
    
    // Validate inputs
    validateInputs(inputs);
    
    core.info(`Starting sync with direction: ${inputs.direction}`);
    core.info(`Issues path: ${inputs.issuesPath}`);
    core.info(`Conflict strategy: ${inputs.conflictStrategy}`);
    
    let syncedCount = 0;
    let conflictsCount = 0;
    
    if (inputs.direction === 'pull' || inputs.direction === 'both') {
      core.info('Starting pull sync (GitHub → Local)...');
      const pullResult = await syncPull(inputs);
      syncedCount += pullResult.synced;
      conflictsCount += pullResult.conflicts;
      core.info(`Pull sync completed: ${pullResult.synced} synced, ${pullResult.conflicts} conflicts`);
    }
    
    if (inputs.direction === 'push' || inputs.direction === 'both') {
      core.info('Starting push sync (Local → GitHub)...');
      const pushResult = await syncPush(inputs);
      syncedCount += pushResult.synced;
      conflictsCount += pushResult.conflicts;
      core.info(`Push sync completed: ${pushResult.synced} synced, ${pushResult.conflicts} conflicts`);
    }
    
    core.setOutput('synced-count', syncedCount.toString());
    core.setOutput('conflicts-count', conflictsCount.toString());
    
    if (conflictsCount > 0) {
      core.warning(`${conflictsCount} conflicts detected. Check .conflicts/ directory for details.`);
    }
    
    core.info(`🎉 Sync completed successfully: ${syncedCount} issues synced, ${conflictsCount} conflicts`);
    
  } catch (error) {
    core.error(`Sync failed: ${error.message}`);
    core.debug(`Stack trace: ${error.stack}`);
    core.setFailed(error.message);
  }
}

// Only run if this is the main module (not being imported for tests)
if (require.main === module) {
  run();
}

module.exports = { run };
