import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { tokenService } from '../../services';

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const accessToken = tokenService.generateAccessToken(user._id as any, user.role);
    const refreshToken = tokenService.generateRefreshToken(
      user._id as any,
      user.role
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('jwt', refreshToken, cookieOptions);

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
            forcePasswordChange: user.forcePasswordChange ?? false,
          },
          accessToken,
        },
        'Logged in successfully'
      )
    );
  }
);
