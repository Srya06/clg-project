import { Request, Response, NextFunction } from 'express';
import { Roadmap } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';

export const getRoadmap = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const roadmap = await Roadmap.findOne({
      studentId: req.user?.id,
      status: 'active',
    }).sort({ createdAt: -1 });

    res
      .status(200)
      .json(
        new ApiResponse(200, roadmap, 'Active roadmap retrieved successfully')
      );
  }
);
