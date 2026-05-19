import { User, Roadmap } from '../../models';
import emailService from './emailService';
import notificationService from './notificationService';
import { logger, enums } from '../../utils';
import { isWithinDays } from '../../utils/helpers/dateHelpers';

const { ROADMAP_STATUS, NOTIFICATION_TYPE, USER_ROLE } = enums;

/**
 * Reminder Service
 */

/**
 * Sends email + in-app notification to students who have an active roadmap
 * but haven't updated it within the last 2 days.
 *
 * @returns {Promise<number>} Count of reminders sent
 */
export const sendRoadmapReminders = async (): Promise<number> => {
  let count = 0;
  try {
    // Find all in-progress roadmaps with their associated student
    const roadmaps = await Roadmap.find({
      status: ROADMAP_STATUS.IN_PROGRESS,
    }).populate<{ studentId: { email: string; _id: any; firstName: string; lastName: string } }>(
      'studentId',
      'email firstName lastName'
    );

    for (const roadmap of roadmaps) {
      const student = roadmap.studentId as any;
      if (!student || !student.email) continue;

      // Only remind if the roadmap hasn't been updated in > 2 days
      const lastUpdate = (roadmap as any).updatedAt || (roadmap as any).createdAt;
      if (isWithinDays(lastUpdate, 2)) continue; // recently active — skip

      const pendingTasks = roadmap.tasks.filter((t) => !t.isCompleted);
      if (pendingTasks.length === 0) continue;

      const roadmapData = {
        weekNumber: roadmap.weekNumber,
        pendingCount: pendingTasks.length,
        roadmapId: roadmap._id,
      };

      // 1. Email reminder
      await emailService.sendRoadmapReminderEmail(student.email, roadmapData);

      // 2. In-app notification
      await notificationService.createNotification({
        userId: student._id,
        title: 'Roadmap Reminder',
        message: `You have ${pendingTasks.length} pending task(s) in Week ${roadmap.weekNumber}. Keep the momentum going!`,
        type: NOTIFICATION_TYPE.REMINDER as any,
      });

      count++;
    }

    logger.info(
      `ReminderService.sendRoadmapReminders: Sent ${count} roadmap reminders.`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`ReminderService.sendRoadmapReminders error: ${message}`);
  }
  return count;
};

/**
 * Sends in-app notifications to students who haven't logged in
 * or triggered any activity for 7+ days.
 *
 * @returns {Promise<number>} Count of reminders sent
 */
export const sendInactivityReminders = async (): Promise<number> => {
  let count = 0;
  try {
    const students = await User.find({ role: USER_ROLE.STUDENT });

    for (const student of students) {
      // Use account updatedAt as activity proxy
      const lastActive = (student as any).updatedAt || (student as any).createdAt;
      if (isWithinDays(lastActive, 7)) continue; // still active — skip

      await notificationService.createNotification({
        userId: student._id,
        title: 'We miss you! 👋',
        message:
          "You haven't been active in a while. Log in to check your roadmap progress and keep building your skills.",
        type: NOTIFICATION_TYPE.SYSTEM as any,
      });

      count++;
    }

    logger.info(
      `ReminderService.sendInactivityReminders: Sent ${count} inactivity nudges.`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`ReminderService.sendInactivityReminders error: ${message}`);
  }
  return count;
};

/**
 * Master reminder runner. Called by the cron job.
 */
export const runAllReminders = async (): Promise<void> => {
  logger.info('ReminderService: Starting reminder run...');
  const roadmapCount = await sendRoadmapReminders();
  const inactivityCount = await sendInactivityReminders();
  logger.info(
    `ReminderService: Done. Roadmap: ${roadmapCount}, Inactivity: ${inactivityCount}.`
  );
};
