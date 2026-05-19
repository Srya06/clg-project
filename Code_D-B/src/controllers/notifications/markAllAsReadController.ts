import { Request, Response, NextFunction } from 'express';
import { Notification } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';

export const markAllAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Notification.updateMany(
      { userId: req.user?.id, isRead: false },
      { $set: { isRead: true } }
    );

    res
      .status(200)
      .json(new ApiResponse(200, null, 'All notifications marked as read'));
  }
);
