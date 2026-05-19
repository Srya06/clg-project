import { Request, Response, NextFunction } from 'express';
import { Achievement } from '../../models';
import { catchAsync, ApiResponse, AppError } from '../../utils';

export const createAchievement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, type, category, date, winnerName, winnerId, image, isFeatured } = req.body;

    const achievement = await Achievement.create({
      title,
      description,
      type,
      category,
      date,
      winnerName,
      winnerId,
      image,
      isFeatured,
    });

    res.status(201).json(new ApiResponse(201, { achievement }, 'Achievement created successfully'));
  }
);

export const getAllAchievements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const achievements = await Achievement.find().sort({ date: -1 });
    res.status(200).json(new ApiResponse(200, { achievements }, 'Achievements retrieved successfully'));
  }
);

export const getFeaturedAchievements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const achievements = await Achievement.find({ isFeatured: true }).sort({ date: -1 });
    res.status(200).json(new ApiResponse(200, { achievements }, 'Featured achievements retrieved successfully'));
  }
);
