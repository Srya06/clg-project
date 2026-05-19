import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, ApiResponse } from '../../utils';
import { scoringAlgorithmService, gradeCalculatorService } from '../../services';

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
  return scoringAlgorithmService.calculateTotalScore({
    codingActivity,
    projects,
    problemSolving,
    consistency,
  });
};

export const getTopPerformers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 10;
    const students = await User.find({ role: 'student' }).select(
      'firstName lastName email branch year repoCount leetcodeSolved resumeAnalysis lastGithubSync'
    );

    const ranked = students
      .map((s) => {
        const score = computeScore(s);
        return {
          _id: s._id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email,
          branch: s.branch,
          year: s.year,
          totalScore: score,
          grade: gradeCalculatorService.calculateGrade(score),
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { students: ranked },
          'Top performers retrieved successfully'
        )
      );
  }
);
