import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';
import { scoringAlgorithmService, gradeCalculatorService } from '../../services';

/**
 * Computes a live score for a user document.
 */
const computeScore = (user: any) => {
  const codingActivity = Math.min(100, (user.repoCount || 0) * 2);
  const projects = Math.min(
    100,
    (user.resumeAnalysis?.projectCount || 0) * 15
  );
  const problemSolving = Math.min(100, (user.leetcodeSolved || 0) * 2);

  let consistency = 0;
  if (user.lastGithubSync) {
    const days = Math.floor(
      (Date.now() - new Date(user.lastGithubSync).getTime()) / 86400000
    );
    if (days <= 7) consistency = 100;
    else if (days <= 30) consistency = 50;
  }

  const totalScore = scoringAlgorithmService.calculateTotalScore({
    codingActivity,
    projects,
    problemSolving,
    consistency,
  });
  const grade = gradeCalculatorService.calculateGrade(totalScore);
  return { totalScore, grade };
};

export const getStudents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, search = '', branch = '' } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = { role: 'student' };
    
    // Automatically filter by HOD's department if applicable
    if (req.user && req.user.role === 'hod' && req.user.department) {
      filter.branch = req.user.department;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) filter.branch = branch;

    const [students, total] = await Promise.all([
      User.find(filter)
        .select(
          'firstName lastName email branch year cgpa repoCount leetcodeSolved resumeAnalysis lastGithubSync githubUsername githubConnected academicRankScore credits'
        )
        .sort({ academicRankScore: -1, credits: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    const enriched = students.map((s) => {
      const { totalScore, grade } = computeScore(s);
      let risk = 'Low';
      if (totalScore < 40) risk = 'High';
      else if (totalScore < 70) risk = 'Medium';

      let status = 'Average';
      if (totalScore >= 85) status = 'Excellent';
      else if (totalScore < 40) status = 'At Risk';
      else if (totalScore < 60) status = 'Underperforming';

      return {
        _id: s._id,
        id: s._id.toString().substring(0, 9).toUpperCase(), // Mock UID for frontend format
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        branch: s.branch,
        year: s.year,
        cgpa: s.cgpa || (totalScore / 10).toFixed(1),
        progress: totalScore,
        status: status,
        risk: risk,
        githubConnected: (s as any).githubConnected,
        githubUsername: (s as any).githubUsername,
        repoCount: (s as any).repoCount,
        leetcodeSolved: (s as any).leetcodeSolved,
        totalScore,
        grade,
      };
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          students: enriched,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
        'Students retrieved successfully'
      )
    );
  }
);
