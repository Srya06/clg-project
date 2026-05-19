import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, Integration, Otp } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { emailService } from '../../services';

/** Generate a cryptographically adequate 6-digit OTP */
function generateOtp(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return digits;
}

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      department,
      branch,
      year,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return next(
        new AppError(
          'Please provide all required fields (email, password, firstName, lastName)',
          400
        )
      );
    }

    // ── SECURITY: Block privilege escalation via self-registration ──────────
    const requestedRole = (role || 'student').toLowerCase();
    if (requestedRole === 'hod' || requestedRole === 'admin') {
      return next(
        new AppError(
          'Privileged accounts cannot be created through public registration. Contact your system administrator.',
          403
        )
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is unverified, allow re-sending OTP
      if (!existingUser.isVerified) {
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Replace any existing OTP
        await Otp.findOneAndDelete({ email });
        await Otp.create({
          email,
          hashedOtp,
          attempts: 0,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        emailService.sendVerificationOtp(email, existingUser.firstName, otp).catch(() => {});

        return res.status(200).json(
          new ApiResponse(
            200,
            { status: 'verification_required', email },
            'Account exists but email is not verified. A new OTP has been sent.'
          )
        );
      }
      return next(new AppError('Email already in use', 400));
    }

    // Create user as unverified
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
      department: role === 'hod' ? department : undefined,
      branch: role === 'student' ? branch : undefined,
      year: role === 'student' ? year : undefined,
      isVerified: false,
    });

    // Only Students need Integration record
    if (newUser.role === 'student') {
      await Integration.create({ studentId: newUser._id });
    }

    // Generate and save OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      email,
      hashedOtp,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    emailService.sendVerificationOtp(email, firstName, otp).catch((err) => {
      console.error('[Register] Failed to send OTP email:', err.message);
    });

    res.status(201).json(
      new ApiResponse(
        201,
        {
          status: 'verification_required',
          email,
        },
        'Account created! Please check your email for a 6-digit verification code.'
      )
    );
  }
);
