import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    if (!password) {
      return next(new AppError('Please provide a new password', 400));
    }

    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token as string)
      .digest('hex');

    // Find user with this token and check if it's unexpired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Password reset successful'));
  }
);
