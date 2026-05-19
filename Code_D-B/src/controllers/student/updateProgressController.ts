import { Request, Response, NextFunction } from 'express';
import { Roadmap } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import creditService from '../../services/creditService';

export const updateProgress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { roadmapId, weekNumber, taskId, isCompleted } = req.body;
    const studentId = req.user?.id;

    if (!roadmapId || !taskId) {
      return next(new AppError('roadmapId and taskId are required', 400));
    }

    // 1. Find the roadmap
    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      studentId
    });

    if (!roadmap) {
      return next(new AppError('Roadmap not found', 404));
    }

    // 2. Find and update the task in the weeks array
    let taskFound = false;
    for (const week of roadmap.weeks) {
      if (weekNumber && week.weekNumber !== weekNumber) continue;
      
      const task = week.tasks.find((t: any) => t._id.toString() === taskId);
      if (task) {
        task.isCompleted = isCompleted;
        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      return next(new AppError('Task not found in this roadmap', 404));
    }

    // 3. Update overall progress
    const totalTasks = roadmap.weeks.reduce((acc, w) => acc + w.tasks.length, 0);
    const completedTasks = roadmap.weeks.reduce((acc, w) => 
      acc + w.tasks.filter(t => t.isCompleted).length, 0
    );
    
    roadmap.completionPercentage = Math.round((completedTasks / totalTasks) * 100);
    
    if (roadmap.completionPercentage === 100) {
      roadmap.status = 'completed';
    }

    await roadmap.save();

    // 4. Update Student Credits (Asynchronous)
    creditService.updateStudentCredits(studentId as string);

    res.status(200).json(
      new ApiResponse(200, { roadmap }, 'Progress updated and credits recalculated!')
    );
  }
);
