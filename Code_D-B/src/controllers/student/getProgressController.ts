import { Request, Response, NextFunction } from 'express';
import { Progress } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';

export const getProgress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const progressList = await Progress.find({
      studentId: req.user?.id,
    }).populate('roadmapId');
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          progressList,
          'Progress history retrieved successfully'
        )
      );
  }
);
