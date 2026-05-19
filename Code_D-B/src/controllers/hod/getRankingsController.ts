import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';
import { IUser } from '../../types/models';

export const getRankings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 50;
    const { branch, year, sortBy } = req.query;

    const query: any = { role: 'student' };
    
    // Automatically filter by HOD's department if applicable
    if (req.user && req.user.role === 'hod' && req.user.department) {
      query.branch = req.user.department;
    }

    if (branch) query.branch = branch;
    if (year) query.year = Number(year);

    // Default sort by academicRankScore (Blueprint 40/30/30 formula)
    const sortField = sortBy === 'credits' ? 'credits' : 'academicRankScore';

    const students = await User.find(query)
      .select('firstName lastName email branch year credits academicRankScore cgpa githubAvatar leetcodeSolved repoCount')
      .sort({ [sortField]: -1, credits: -1 })
      .limit(limit) as unknown as (IUser & { academicRankScore: number })[];

    const rankings = students.map((s, i) => ({
      rank: i + 1,
      id: s._id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      branch: s.branch || 'CSE-AI',
      year: s.year,
      score: s.academicRankScore || 0,
      credits: s.credits || 0,
      cgpa: s.cgpa || 0,
      avatar: s.githubAvatar || null,
      initials: `${s.firstName[0] || ''}${s.lastName[0] || ''}`.toUpperCase(),
      stats: {
        repos: s.repoCount || 0,
        leetcode: s.leetcodeSolved || 0
      }
    }));

    res.status(200).json(
      new ApiResponse(200, { 
        rankings,
        rankingMethod: sortField === 'academicRankScore' ? 'Academic (40/30/30)' : 'Credits (Gamification)'
      }, 'Leaderboard rankings retrieved successfully')
    );
  }
);
