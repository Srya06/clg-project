import { Request, Response } from 'express';
import { catchAsync, AppError } from '../../utils';
import agentOrchestrator from '../../services/ai/agentOrchestrator';

/**
 * AI Academic Monitoring for a student
 * GET /api/v1/ai/monitor/:studentId
 */
export const monitorStudent = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;

  if (!studentId) {
    throw new AppError('Student ID is required', 400);
  }

  // Ensure only HOD, Teacher, or the Student themselves can access this
  if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
    throw new AppError('You do not have permission to access this analysis', 403);
  }

  const analysis = await agentOrchestrator.monitorStudent(studentId as string);

  res.status(200).json({
    success: true,
    data: analysis,
  });
});
