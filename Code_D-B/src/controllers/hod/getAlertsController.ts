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

export const getAlerts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const threshold = Number(req.query.threshold) || 50;

    const students = await User.find({ role: 'student' }).select(
      'firstName lastName email branch year repoCount leetcodeSolved resumeAnalysis lastGithubSync lastLeetcodeSync githubConnected githubUsername leetcodeUsername'
    );

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const alerts: any[] = [];

    students.forEach((s: any) => {
      const score = computeScore(s);
      const grade = gradeCalculatorService.calculateGrade(score);
      const reasons: string[] = [];

      if (score < threshold) reasons.push(`Low score: ${score}`);
      if (!s.githubConnected) reasons.push('GitHub not connected');
      if (!s.leetcodeUsername) reasons.push('LeetCode not synced');
      if (
        !s.lastGithubSync ||
        now - new Date(s.lastGithubSync).getTime() > thirtyDays
      ) {
        reasons.push('No GitHub activity in 30+ days');
      }

      if (reasons.length > 0) {
        alerts.push({
          _id: s._id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email,
          branch: s.branch,
          year: s.year,
          score,
          grade,
          alertReasons: reasons,
        });
      }
    });

    // Sort worst first
    alerts.sort((a, b) => a.score - b.score);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          count: alerts.length,
          threshold,
          alerts,
        },
        'Student alerts retrieved successfully'
      )
    );
  }
);
