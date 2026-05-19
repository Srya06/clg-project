import { Request, Response, NextFunction } from 'express';
import { Announcement, User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { emailService } from '../../services';

/**
 * POST /api/v1/hod/announcements
 */
export const createAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      body,
      priority,
      targetBranch,
      targetYear,
      expiresAt,
      notifyByEmail,
    } = req.body;

    if (!title || !body) {
      return next(new AppError('Title and body are required', 400));
    }

    const announcement = await Announcement.create({
      title,
      body,
      priority: priority || 'medium',
      targetBranch: targetBranch || null,
      targetYear: targetYear || null,
      createdBy: req.user?.id,
      expiresAt: expiresAt || null,
    });

    // Email notify matching students (fire-and-forget)
    if (notifyByEmail) {
      const filter: any = { role: 'student' };
      if (targetBranch) filter.branch = targetBranch;
      if (targetYear) filter.year = targetYear;

      const students = await User.find(filter).select('email firstName');
      const emailPromises = students.map((s) =>
        emailService.send({
          to: s.email,
          subject: `📢 New Announcement: ${title}`,
          html: `<h2>${title}</h2><p>Dear ${
            s.firstName
          },</p><p>${body}</p><p>Log in to <a href="${
            process.env.FRONTEND_URL || 'http://localhost:3000'
          }">Code DB</a> to view details.</p>`,
        })
      );
      // Non-blocking
      Promise.allSettled(emailPromises);
    }

    res
      .status(201)
      .json(
        new ApiResponse(201, announcement, 'Announcement created successfully')
      );
  }
);

/**
 * GET /api/v1/hod/announcements
 */
export const getAnnouncements = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { archived = 'false', page = 1, limit = 20 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      createdBy: req.user?.id,
      isArchived: archived === 'true',
    };

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'firstName lastName'),
      Announcement.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          announcements,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
        'Announcements retrieved successfully'
      )
    );
  }
);

/**
 * DELETE /api/v1/hod/announcements/:id
 */
export const deleteAnnouncement = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user?.id },
      { isArchived: true },
      { new: true }
    );

    if (!announcement) {
      return next(new AppError('Announcement not found or not authorized', 404));
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Announcement archived successfully'));
  }
);
