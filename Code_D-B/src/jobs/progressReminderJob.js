const { runAllReminders } = require('../services/notifications/reminderService');
const logger = require('../utils/logger');

/**
 * Daily progress reminder cron job — runs at 9 AM every day.
 * Delegates all logic to reminderService to keep this file as
 * a thin scheduled-trigger shell only.
 */
const progressReminderJob = async () => {
  try {
    await runAllReminders();
  } catch (error) {
    logger.error(`progressReminderJob: Unhandled error: ${error.message}`);
  }
};

module.exports = progressReminderJob;
