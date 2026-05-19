import { Types } from 'mongoose';
import { Notification } from '../../models';
import { logger } from '../../utils';
import { INotification } from '../../types/models';

interface CreateNotificationParams {
  userId: string | Types.ObjectId;
  title: string;
  message: string;
  type?: 'alert' | 'reminder' | 'system' | 'message';
}

class NotificationService {
  async createNotification({
    userId,
    title,
    message,
    type = 'system',
  }: CreateNotificationParams): Promise<INotification> {
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
      });
      return notification;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Error creating notification: ${msg}`);
      throw error;
    }
  }

  async getUnreadNotifications(
    userId: string | Types.ObjectId
  ): Promise<INotification[]> {
    try {
      return await Notification.find({ userId, isRead: false }).sort('-createdAt');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching unread notifications: ${msg}`);
      throw error;
    }
  }

  async markAsRead(
    notificationId: string | Types.ObjectId
  ): Promise<INotification | null> {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Error marking notification as read: ${msg}`);
      throw error;
    }
  }
}

export default new NotificationService();
