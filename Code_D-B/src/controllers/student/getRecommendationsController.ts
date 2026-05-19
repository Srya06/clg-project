import { Request, Response, NextFunction } from 'express';
import { recommendResources } from '../../services';
import { catchAsync, ApiResponse } from '../../utils';

export const getRecommendations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { topic = 'programming', difficulty = 'beginner' } = req.query as any;
    const resources = await recommendResources(topic, difficulty);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          resources,
          'Resource recommendations retrieved successfully'
        )
      );
  }
);
