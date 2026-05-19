import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res
      .status(200)
      .json(new ApiResponse(200, user, 'User profile retrieved successfully'));
  }
);
