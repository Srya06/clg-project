import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { scoringAlgorithmService, gradeCalculatorService } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const getScore = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const repoCount = user.repoCount || 0;
    const codingActivity = Math.min(100, repoCount * 2);

    const projectCount = (user.resumeAnalysis as any)?.projectCount || 0;
    const projects = Math.min(100, (projectCount as number) * 15);

    const leetcodeSolved = (user as any).leetcodeSolved || 0;
    const problemSolving = Math.min(100, leetcodeSolved * 2);

    let consistency = 0;
    if (user.lastGithubSync) {
      const daysSinceSync = Math.floor(
        (Date.now() - new Date(user.lastGithubSync).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceSync <= 7) consistency = 100;
      else if (daysSinceSync <= 30) consistency = 50;
    }

    const totalScore = scoringAlgorithmService.calculateTotalScore({
      codingActivity,
      projects,
      problemSolving,
      consistency,
    });

    const grade = gradeCalculatorService.calculateGrade(totalScore);

    const learningTime = Math.round(
      repoCount * 3 + leetcodeSolved * 0.5 + (projectCount as number) * 5
    );
    const quizScore = Math.min(100, Math.round(85 + totalScore / 20));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          totalScore,
          grade,
          learningTime,
          quizScore,
          breakdown: {
            codingActivity: {
              score: codingActivity,
              weight: '30%',
              source: `${repoCount} GitHub repos`,
            },
            projects: {
              score: projects,
              weight: '30%',
              source: `${projectCount} resume projects`,
            },
            problemSolving: {
              score: problemSolving,
              weight: '20%',
              source: `${leetcodeSolved} LeetCode solved`,
            },
            consistency: {
              score: consistency,
              weight: '20%',
              source: user.lastGithubSync ? 'GitHub synced' : 'Not synced',
            },
          },
        },
        'Score retrieved successfully'
      )
    );
  }
);
