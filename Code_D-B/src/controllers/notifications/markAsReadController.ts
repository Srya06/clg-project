import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const notificationId = req.params.id as string;

    const notification = await notificationService.markAsRead(notificationId);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res
      .status(200)
      .json(new ApiResponse(200, notification, 'Notification marked as read'));
  }
);
