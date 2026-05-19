import { Request, Response, NextFunction } from 'express';
import { User, Roadmap } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import agentOrchestrator from '../../services/ai/agentOrchestrator';
import logger from '../../utils/logger';

export const generateRoadmap = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { goal } = req.body;
    const studentId = req.user?.id;

    if (!goal) {
      return next(new AppError('Goal is required', 400));
    }

    // 1. Fetch student for context
    const student = await User.findById(studentId);
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // 2. Archive existing active roadmaps
    await Roadmap.updateMany(
      { studentId, status: 'active' },
      { status: 'archived' }
    );

    // 3. Orchestrate multi-agent generation
    try {
      const roadmapData = await agentOrchestrator.orchestrateRoadmap(goal, {
        firstName: student.firstName,
        branch: student.branch || (student as any).department,
        year: student.year,
        skills: student.skills,
        bio: student.bio,
        resumeAnalysis: student.resumeAnalysis
      });

      // 4. Create master roadmap
      const newRoadmap = await Roadmap.create({
        studentId,
        title: `${goal} Roadmap`,
        targetRole: goal,
        weeks: roadmapData,
        status: 'active',
        currentWeek: 1
      });

      // 5. Update student career goal
      await User.findByIdAndUpdate(studentId, { careerGoal: goal });

      logger.info(`AI Crew generated roadmap for ${studentId}: ${goal}`);

      res.status(201).json(
        new ApiResponse(201, newRoadmap, 'Your AI Crew has built your roadmap!')
      );
    } catch (error: any) {
      logger.error('Agent Orchestration failed:', error);
      return next(new AppError('The AI Crew encountered an error. Please try again.', 500));
    }
  }
);
