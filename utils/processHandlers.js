const logger = require('./logger');

function registerProcessHandlers(server) {
  process.on('uncaughtException', err => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', err => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    if (server && typeof server.close === 'function') {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

module.exports = { registerProcessHandlers };
