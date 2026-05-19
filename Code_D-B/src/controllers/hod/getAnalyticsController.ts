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

export const getAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const students = await User.find({ role: 'student' }).select(
      'firstName lastName email branch year repoCount leetcodeSolved resumeAnalysis lastGithubSync githubConnected githubUsername leetcodeUsername'
    );

    if (!students.length) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            totalStudents: 0,
            avgScore: 0,
            topScore: 0,
            gradeDistribution: {},
          },
          'Analytics retrieved successfully'
        )
      );
    }

    const scores = students.map((s) => computeScore(s));
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    const topScore = Math.max(...scores);

    const gradeDistribution: Record<string, number> = {
      'A+': 0,
      A: 0,
      'B+': 0,
      B: 0,
      C: 0,
      F: 0,
    };
    scores.forEach((score) => {
      const grade = gradeCalculatorService.calculateGrade(score);
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    const githubConnectedCount = students.filter(
      (s: any) => s.githubConnected
    ).length;
    const leetcodeConnectedCount = students.filter(
      (s: any) => s.leetcodeUsername
    ).length;

    const branchBreakdown: Record<string, number> = {};
    students.forEach((s) => {
      if (s.branch) branchBreakdown[s.branch] = (branchBreakdown[s.branch] || 0) + 1;
    });

    const atRiskCount = scores.filter((s) => s < 40).length;
    const topPerformersCount = scores.filter((s) => s >= 85).length;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          totalStudents: students.length,
          averagePerformance: avgScore,
          topScore,
          atRiskCount,
          topPerformersCount,
          gradeDistribution,
          githubConnectedCount,
          leetcodeConnectedCount,
          branchBreakdown,
        },
        'Analytics retrieved successfully'
      )
    );
  }
);
