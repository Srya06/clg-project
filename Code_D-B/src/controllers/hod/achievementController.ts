import { Request, Response } from 'express';
import { Achievement } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const createAchievement = catchAsync(async (req: Request, res: Response) => {
  const achievement = await Achievement.create(req.body);
  res.status(201).json(new ApiResponse(201, achievement, 'Achievement recorded in Hall of Fame'));
});

export const getAchievements = catchAsync(async (req: Request, res: Response) => {
  const achievements = await Achievement.find().sort({ date: -1 });
  res.status(200).json(new ApiResponse(200, achievements));
});

export const updateAchievement = catchAsync(async (req: Request, res: Response) => {
  const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!achievement) throw new AppError('Achievement not found', 404);
  res.status(200).json(new ApiResponse(200, achievement, 'Achievement updated'));
});

export const deleteAchievement = catchAsync(async (req: Request, res: Response) => {
  const achievement = await Achievement.findByIdAndDelete(req.params.id);
  if (!achievement) throw new AppError('Achievement not found', 404);
  res.status(200).json(new ApiResponse(200, null, 'Achievement removed from Hall of Fame'));
});
