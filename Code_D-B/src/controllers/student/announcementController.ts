import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const getStudentAnnouncements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { branch, year } = req.user as any;

    const filter = {
      isArchived: false,
      $or: [
        { targetBranch: null, targetYear: null }, // Global
        { targetBranch: branch, targetYear: null }, // Branch-wide
        { targetBranch: null, targetYear: year }, // Year-wide
        { targetBranch: branch, targetYear: year }, // Branch + year specific
      ],
      $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }],
    };

    const announcements = await Announcement.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .populate('createdBy', 'firstName lastName')
      .lean();

    const userId = (req.user?.id as any).toString();
    const enriched = announcements.map((a: any) => ({
      ...a,
      acknowledged: a.acknowledgements.some(
        (ack: any) => ack.studentId.toString() === userId
      ),
    }));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          enriched,
          'Announcements retrieved successfully'
        )
      );
  }
);

export const respondToAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { response = '' } = req.body;
    const userId = req.user?.id;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement || announcement.isArchived) {
      return next(new AppError('Announcement not found', 404));
    }

    // Check if already acknowledged
    const alreadyAcked = announcement.acknowledgements.some(
      (a: any) => a.studentId.toString() === userId?.toString()
    );

    if (alreadyAcked) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Already acknowledged'));
    }

    announcement.acknowledgements.push({
      studentId: userId as any,
      response,
      readAt: new Date(),
    });
    await announcement.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, null, 'Announcement acknowledged successfully')
      );
  }
);
