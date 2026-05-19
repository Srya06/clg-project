import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, Otp } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { emailService } from '../../services';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const resendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide your email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('No account found with this email', 404));
    }

    if (user.isVerified) {
      return next(new AppError('This email is already verified', 400));
    }

    // Delete existing OTP
    await Otp.deleteOne({ email: email.toLowerCase() });

    // Generate new OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      email: email.toLowerCase(),
      hashedOtp,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    emailService.sendVerificationOtp(email, user.firstName, otp).catch((err) => {
      console.error('[ResendOtp] Email failed:', err.message);
    });

    res.status(200).json(
      new ApiResponse(200, { email }, 'A new verification code has been sent to your email.')
    );
  }
);
