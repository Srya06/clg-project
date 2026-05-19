import { Request, Response, NextFunction } from 'express';
import { User, Notification } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const messageStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, message } = req.body;

    if (!message) {
      return next(new AppError('Message content is required', 400));
    }

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    await Notification.create({
      userId: student._id,
      title: title || `Message from HOD`,
      message,
      type: 'message'
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Message sent to student successfully')
    );
  }
);
