import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, Otp } from '../../models';
import { catchAsync, AppError, ApiResponse, logger } from '../../utils';
import { tokenService, emailService } from '../../services';

// ── Password strength validator ────────────────────────────────────────────────
function isStrongPassword(password: string): boolean {
  // Min 8 chars, 1 uppercase, 1 number, 1 special character
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password);
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── HOD Login ─────────────────────────────────────────────────────────────────
export const hodLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user and select password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      // Generic message prevents user enumeration
      return next(new AppError('Invalid HOD credentials', 401));
    }

    // ── RBAC: Reject non-HOD accounts ────────────────────────────────────────
    if (user.role !== 'hod') {
      logger.warn(`[HOD Auth] Unauthorized login attempt by role '${user.role}' (${email})`);
      return next(new AppError('Access denied. This portal is restricted to HOD users only.', 403));
    }

    // ── Audit log ────────────────────────────────────────────────────────────
    logger.info(`[HOD Auth] Login success: ${email} from IP ${req.ip}`);

    const accessToken = tokenService.generateAccessToken(user._id as any, user.role);
    const refreshToken = tokenService.generateRefreshToken(user._id as any, user.role);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

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
            department: user.department,
            forcePasswordChange: user.forcePasswordChange ?? false,
          },
          accessToken,
          forcePasswordChange: user.forcePasswordChange ?? false,
        },
        user.forcePasswordChange
          ? 'Login successful. You must change your password before continuing.'
          : 'HOD logged in successfully'
      )
    );
  }
);

// ── HOD Change Password (force-change + voluntary) ───────────────────────────
export const hodChangePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('Please provide currentPassword, newPassword, and confirmPassword', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('New password and confirmation do not match', 400));
    }

    if (!isStrongPassword(newPassword)) {
      return next(
        new AppError(
          'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character',
          400
        )
      );
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user || user.role !== 'hod') {
      return next(new AppError('Access denied', 403));
    }

    const isCurrentCorrect = await user.comparePassword(currentPassword, user.password);
    if (!isCurrentCorrect) {
      return next(new AppError('Current password is incorrect', 401));
    }

    if (currentPassword === newPassword) {
      return next(new AppError('New password must differ from your current password', 400));
    }

    user.password = newPassword;
    user.forcePasswordChange = false;
    user.lastPasswordChange = new Date();
    await user.save();

    logger.info(`[HOD Auth] Password changed for: ${user.email}`);

    // Issue new tokens (invalidates old session)
    const accessToken = tokenService.generateAccessToken(user._id as any, user.role);
    const refreshToken = tokenService.generateRefreshToken(user._id as any, user.role);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json(
      new ApiResponse(200, { accessToken }, 'Password updated successfully. Your session has been refreshed.')
    );
  }
);

// ── HOD Forgot Password (OTP via email) ──────────────────────────────────────
export const hodForgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide your HOD email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Anti-enumeration: always return success
    if (!user || user.role !== 'hod') {
      return res.status(200).json(
        new ApiResponse(200, null, 'If that HOD email is registered, you will receive a reset OTP.')
      );
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.findOneAndDelete({ email: user.email });
    await Otp.create({
      email: user.email,
      hashedOtp,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    emailService.sendHodPasswordResetOtp(user.email, user.firstName, otp).catch((err) => {
      logger.error(`[HOD Auth] Failed to send reset OTP to ${user.email}: ${err.message}`);
    });

    logger.info(`[HOD Auth] Password reset OTP sent to: ${user.email}`);

    res.status(200).json(
      new ApiResponse(200, null, 'If that HOD email is registered, you will receive a reset OTP.')
    );
  }
);

// ── HOD Verify Reset OTP & Set New Password ───────────────────────────────────
export const hodVerifyResetOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return next(new AppError('Please provide email, OTP, newPassword, and confirmPassword', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (!isStrongPassword(newPassword)) {
      return next(
        new AppError(
          'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character',
          400
        )
      );
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase().trim() });
    if (!otpRecord) {
      return next(new AppError('OTP expired or not found. Please request a new one.', 400));
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isMatch) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return next(new AppError('Too many incorrect attempts. OTP invalidated. Request a new one.', 429));
      }
      await otpRecord.save();
      return next(new AppError('Incorrect OTP', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== 'hod') {
      return next(new AppError('No HOD account found with this email', 404));
    }

    user.password = newPassword;
    user.forcePasswordChange = false;
    user.lastPasswordChange = new Date();
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    logger.info(`[HOD Auth] Password reset via OTP for: ${user.email}`);

    res.status(200).json(
      new ApiResponse(200, null, 'Password has been reset successfully. Please log in with your new password.')
    );
  }
);
