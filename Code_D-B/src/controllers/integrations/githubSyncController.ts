import { Request, Response, NextFunction } from 'express';
import { Integration } from '../../models';
import { githubService } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const githubSync = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let integration = await Integration.findOne({ studentId: req.user?.id });

    if (!integration || !integration.githubToken) {
      return next(
        new AppError('GitHub is not connected. Please connect GitHub first.', 400)
      );
    }

    const token = integration.githubToken;

    try {
      // Validate token
      const profile = await githubService.fetchUserProfile(token);

      if (!profile || !profile.login) {
        return next(new AppError('Invalid GitHub token', 401));
      }

      res.status(200).json(
        new ApiResponse(
          200,
          {
            profile: { login: profile.login, url: profile.html_url },
            syncedAt: (integration as any).githubSyncedAt,
          },
          'GitHub account synced successfully'
        )
      );
    } catch (error) {
      return next(
        new AppError(
          'Failed to sync with GitHub. Invalid token or service down.',
          401
        )
      );
    }
  }
);
