import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services';
import { Notification } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';

export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { unreadOnly } = req.query;

    let notifications: any[];
    if (unreadOnly === 'true') {
      notifications = await notificationService.getUnreadNotifications(
        req.user?.id as any
      );
    } else {
      notifications = await Notification.find({ userId: req.user?.id }).sort(
        '-createdAt'
      );
    }

    // Map to frontend expected keys (id, read)
    const mapped = notifications.map((n) => ({
      id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.isRead,
      createdAt: n.createdAt,
    }));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { notifications: mapped },
          'Notifications retrieved successfully'
        )
      );
  }
);
