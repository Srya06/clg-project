import { Request, Response, NextFunction } from 'express';
import { User, Integration } from '../../models';
import { leetcodeService } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const leetcodeSync = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let username = req.body.username;

    if (!username) {
      const user = await User.findById(req.user?.id);
      username = user?.leetcodeUsername;
    }

    if (!username) {
      return next(new AppError('LeetCode username is required for sync', 400));
    }

    let profile: any;
    try {
      profile = await leetcodeService.fetchUserProfile(username);

      if (!profile || profile.status !== 'success') {
        return next(
          new AppError('Invalid LeetCode username or account is private', 400)
        );
      }
    } catch (error) {
      // Graceful Failure Pattern: Attempt to return cached data if API is down
      const cachedUser = await User.findById(req.user?.id);

      if (
        cachedUser &&
        cachedUser.leetcodeUsername === username &&
        cachedUser.lastLeetcodeSync
      ) {
        return res.status(503).json(
          new ApiResponse(
            503,
            {
              username,
              totalSolved: cachedUser.leetcodeSolved,
              easySolved: (cachedUser as any).leetcodeEasy,
              mediumSolved: (cachedUser as any).leetcodeMedium,
              hardSolved: (cachedUser as any).leetcodeHard,
              syncedAt: cachedUser.lastLeetcodeSync,
              isCached: true,
            },
            'LeetCode service unavailable. Displaying last synced data.'
          )
        );
      }

      return next(
        new AppError(
          'LeetCode service temporarily unavailable. Please try again later.',
          503
        )
      );
    }

    // Persist stats into the User model for use by the scoring engine
    await User.findByIdAndUpdate(req.user?.id, {
      leetcodeUsername: username,
      leetcodeSolved: profile.totalSolved,
      leetcodeEasy: profile.easySolved,
      leetcodeMedium: profile.mediumSolved,
      leetcodeHard: profile.hardSolved,
      lastLeetcodeSync: new Date(),
    });

    // Also update the integrations collection
    const integration = await Integration.findOneAndUpdate(
      { studentId: req.user?.id },
      { leetcodeUsername: username, lastSyncedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          username,
          totalSolved: profile.totalSolved,
          easySolved: profile.easySolved,
          mediumSolved: profile.mediumSolved,
          hardSolved: profile.hardSolved,
          syncedAt: integration.lastSyncedAt,
          isCached: false,
        },
        'LeetCode account synced successfully'
      )
    );
  }
);
