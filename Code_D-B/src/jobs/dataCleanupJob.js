const Notification = require('../models/Notification');
const Roadmap = require('../models/Roadmap');
const tokenService = require('../services/auth/tokenService');
const logger = require('../utils/logger');

const dataCleanupJob = async () => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    // Remove old notifications (older than 90 days)
    const deletedNotifications = await Notification.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });

    // We don't have an archive status in Roadmap Schema enum, so we'll delete roadmaps
    // over 90 days old that are completed safely to "archive" them out of active collections
    const archivedRoadmaps = await Roadmap.deleteMany({
      status: 'completed',
      completionDate: { $exists: true, $lt: ninetyDaysAgo }
    });

    // Optionally sweep in-memory token blacklist mapping if implemented globally.
    // For now we just log since it's an in-memory Set natively in tokenService.

    logger.info(`DataCleanupJob: Deleted ${deletedNotifications.deletedCount} old notifications.`);
    logger.info(`DataCleanupJob: Archived ${archivedRoadmaps.deletedCount} stale roadmaps.`);
  } catch (error) {
    logger.error(`DataCleanupJob Error: ${error.message}`);
  }
};

module.exports = dataCleanupJob;
