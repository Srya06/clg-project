import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { emailService, notificationService } from '../../services';

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    const user = await User.findOne({ email });
    // We return success even if user not found to prevent email enumeration
    if (!user) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            'If that email is registered, you will receive a reset link.'
          )
        );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Save the token fields
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      // Create in-app notification as well
      await notificationService.createNotification({
        userId: user._id as any,
        title: 'Password Reset Request',
        message:
          'A password reset link has been sent to your email. It expires in 15 minutes.',
        type: 'system', // matches INotification type
      });

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            'If that email is registered, you will receive a reset link.'
          )
        );
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending the email. Try again later.', 500)
      );
    }
  }
);
