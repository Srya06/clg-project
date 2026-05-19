import { Request, Response, NextFunction } from 'express';
import { Event } from '../../models';
import { catchAsync, ApiResponse, AppError } from '../../utils';

export const createEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, type, date, location, link, image } = req.body;

    const event = await Event.create({
      title,
      description,
      type,
      date,
      location,
      link,
      image,
      postedBy: req.user?.id,
    });

    res.status(201).json(new ApiResponse(201, { event }, 'Event created successfully'));
  }
);

export const getAllEvents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const events = await Event.find({ isArchived: false }).sort({ date: 1 });
    res.status(200).json(new ApiResponse(200, { events }, 'Events retrieved successfully'));
  }
);

export const archiveEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json(new ApiResponse(200, { event }, 'Event archived successfully'));
  }
);
