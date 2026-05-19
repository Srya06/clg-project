import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import { scoringAlgorithmService, gradeCalculatorService } from '../../services';

export const getStudentDetail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
    }).select('-password -passwordResetToken -passwordResetExpires');

    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // Compute live score
    const codingActivity = Math.min(100, (student.repoCount || 0) * 2);
    const projects = Math.min(
      100,
      ((student.resumeAnalysis as any)?.projectCount || 0) * 15
    );
    const problemSolving = Math.min(100, (student.leetcodeSolved || 0) * 2);
    let consistency = 0;
    if (student.lastGithubSync) {
      const days = Math.floor(
        (Date.now() - new Date(student.lastGithubSync).getTime()) / 86400000
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

    let risk = 'Low';
    if (totalScore < 40) risk = 'High';
    else if (totalScore < 70) risk = 'Medium';

    let status = 'Average';
    if (totalScore >= 85) status = 'Excellent';
    else if (totalScore < 40) status = 'At Risk';
    else if (totalScore < 60) status = 'Underperforming';

    res.status(200).json(
      new ApiResponse(
        200,
        {
          student: {
            ...student.toObject(),
            id: student._id.toString().substring(0, 9).toUpperCase(),
            name: `${student.firstName} ${student.lastName}`,
            progress: totalScore,
            cgpa: student.cgpa || (totalScore / 10).toFixed(1),
            status,
            risk,
            totalScore,
            grade,
          },
        },
        'Student details retrieved successfully'
      )
    );
  }
);
