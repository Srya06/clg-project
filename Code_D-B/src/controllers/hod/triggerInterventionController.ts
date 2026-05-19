import { Request, Response, NextFunction } from 'express';
import { User, Notification } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const triggerIntervention = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body;

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // Create high-priority notification
    await Notification.create({
      userId: student._id,
      title: '⚠️ Academic Intervention Triggered',
      message: `The HOD has triggered an academic intervention: ${reason || 'Please report to the department office immediately.'}`,
      type: 'alert'
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Academic intervention triggered successfully')
    );
  }
);
