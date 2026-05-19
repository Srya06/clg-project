import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { tokenService } from '../../services';

export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken || req.cookies?.jwt;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    try {
      const decoded = tokenService.verifyRefreshToken(refreshToken) as any;
      const newAccessToken = tokenService.generateAccessToken(
        decoded.id,
        decoded.role
      );

      res.status(200).json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
          },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
  }
);
