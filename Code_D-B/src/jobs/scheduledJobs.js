const cron = require('node-cron');
const progressReminderJob = require('./progressReminderJob');
const weeklyReportJob = require('./weeklyReportJob');
const dataCleanupJob = require('./dataCleanupJob');
const logger = require('../utils/logger');

const initializeScheduledJobs = () => {
  logger.info('Initializing scheduled jobs...');

  // Daily progress reminder - 9 AM every day
  cron.schedule('0 9 * * *', () => {
    logger.info('Running daily progress reminder job...');
    progressReminderJob();
  });

  // Weekly report - Every Monday 10 AM
  cron.schedule('0 10 * * 1', () => {
    logger.info('Running weekly report job...');
    weeklyReportJob();
  });

  // Data cleanup - Every Sunday 2 AM
  cron.schedule('0 2 * * 0', () => {
    logger.info('Running data cleanup job...');
    dataCleanupJob();
  });

  logger.info('Scheduled jobs initialized.');
};

module.exports = initializeScheduledJobs;
