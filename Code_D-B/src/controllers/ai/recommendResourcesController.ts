import { Request, Response, NextFunction } from 'express';
import { recommendResources as getRecommendations, detectInterests } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const recommendResources = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { topic, difficulty = 'beginner', text } = req.query as any;

    // If no direct topic, detect from free-form text using keyword detector
    if (!topic && text) {
      const detected = detectInterests(text);
      if (detected.length > 0) {
        topic = detected[0]; // use the first detected interest as the search topic
      }
    }

    if (!topic) {
      return next(
        new AppError(
          'Please provide a topic or text to detect interests from.',
          400
        )
      );
    }

    const resources = await getRecommendations(topic, difficulty);

    res.status(200).json(
      new ApiResponse(
        200,
        { topic, difficulty, resources },
        'Resources recommended successfully'
      )
    );
  }
);
