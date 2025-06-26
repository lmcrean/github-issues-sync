const core = require('@actions/core');

class Logger {
  constructor() {
    this.debugMode = process.env.DEBUG === 'true' || 
                    core.getInput('debug') === 'true' ||
                    process.env.RUNNER_DEBUG === '1';
  }
  
  info(message) {
    core.info(message);
  }
  
  warn(message) {
    core.warning(message);
  }
  
  error(message) {
    core.error(message);
  }
  
  debug(message) {
    if (this.debugMode) {
      core.debug(message);
    }
  }
  
  group(name, fn) {
    return core.group(name, fn);
  }
  
  startGroup(name) {
    core.startGroup(name);
  }
  
  endGroup() {
    core.endGroup();
  }
}

const logger = new Logger();

function setupLogging() {
  logger.info('🔧 GitHub Issues Sync Action initialized');
  if (logger.debugMode) {
    logger.debug('Debug logging enabled');
  }
}

module.exports = { logger, setupLogging };
