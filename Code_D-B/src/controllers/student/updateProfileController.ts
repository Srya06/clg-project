import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';

export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updates: any = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      cgpa: req.body.cgpa,
      branch: req.body.branch,
      // Support both 'year' and 'semester' field names from the frontend
      year: req.body.year ?? req.body.semester,
      bio: req.body.bio,
      skills: req.body.skills,
      linkedinUrl: req.body.linkedinUrl,
      department: req.body.department,
      careerGoal: req.body.careerGoal,
      leetcodeUsername: req.body.leetcodeUsername,
    };

    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    const user = await User.findByIdAndUpdate(req.user?.id, updates, {
      new: true,
    }).select('-password');

    res
      .status(200)
      .json(new ApiResponse(200, user, 'Profile updated successfully'));
  }
);
