import { Request, Response } from 'express';
import { Event, Achievement } from '../models';
import { catchAsync, ApiResponse } from '../utils';

export const getPublicEvents = catchAsync(async (req: Request, res: Response) => {
  const events = await Event.find({ isArchived: false }).sort({ date: 1 });
  res.status(200).json(new ApiResponse(200, events));
});

export const getPublicAchievements = catchAsync(async (req: Request, res: Response) => {
  const achievements = await Achievement.find().sort({ date: -1 });
  res.status(200).json(new ApiResponse(200, achievements));
});
