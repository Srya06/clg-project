import { Request, Response } from 'express';
import { Event } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const createEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await Event.create({
    ...req.body,
    postedBy: req.user?.id
  });

  res.status(201).json(new ApiResponse(201, event, 'Event created successfully'));
});

export const getEvents = catchAsync(async (req: Request, res: Response) => {
  const events = await Event.find({ isArchived: false }).sort({ date: 1 });
  res.status(200).json(new ApiResponse(200, events));
});

export const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!event) throw new AppError('Event not found', 404);
  res.status(200).json(new ApiResponse(200, event, 'Event updated successfully'));
});

export const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { isArchived: true });
  if (!event) throw new AppError('Event not found', 404);
  res.status(200).json(new ApiResponse(200, null, 'Event archived successfully'));
});
