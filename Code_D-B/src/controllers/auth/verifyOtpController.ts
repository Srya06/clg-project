import { Request, Response, NextFunction } from 'express';
import { User, Otp } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { tokenService, emailService } from '../../services';

export const verifyOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError('Please provide your email and OTP code', 400));
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });
    if (!otpRecord) {
      return next(
        new AppError('OTP has expired or does not exist. Please request a new code.', 400)
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return next(
        new AppError('Too many failed attempts. Please register again to get a new code.', 429)
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return next(new AppError('OTP has expired. Please request a new code.', 400));
    }

    // Verify OTP
    const isValid = await otpRecord.compareOtp(otp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 3 - otpRecord.attempts;
      return next(
        new AppError(
          `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          400
        )
      );
    }

    // OTP valid — mark user as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Delete OTP record
    await Otp.deleteOne({ email: email.toLowerCase() });

    // Issue tokens
    const accessToken = tokenService.generateAccessToken(user._id as any, user.role);
    const refreshToken = tokenService.generateRefreshToken(user._id as any, user.role);

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.firstName).catch(() => {});

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            branch: user.branch,
            department: user.department,
          },
          accessToken,
          refreshToken,
        },
        'Email verified successfully. Welcome to Academ OS!'
      )
    );
  }
);
