import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const uploadResume = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(
        new AppError(
          'No resume file received. Please select a PDF or DOCX file.',
          400
        )
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        resumeUrl: `/uploads/resumes/${req.file.filename}`,
        resumeOriginalName: req.file.originalname, // store display name
        resumeUploadedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          resumeUrl: user.resumeUrl,
          resumeOriginalName: (user as any).resumeOriginalName,
          resumeUploadedAt: (user as any).resumeUploadedAt,
        },
        'Resume uploaded successfully'
      )
    );
  }
);
