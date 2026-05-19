import { Request, Response, NextFunction } from 'express';
import { Integration } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';

export const getIntegrationStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const integration = await Integration.findOne({ studentId: req.user?.id });

    const status = {
      github:
        integration && integration.githubToken
          ? { connected: true, syncedAt: (integration as any).githubSyncedAt }
          : { connected: false },
      leetcode:
        integration && (integration as any).leetcodeUsername
          ? {
              connected: true,
              username: (integration as any).leetcodeUsername,
              syncedAt: integration.lastSyncedAt,
            }
          : { connected: false },
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, status, 'Integration status retrieved successfully')
      );
  }
);
