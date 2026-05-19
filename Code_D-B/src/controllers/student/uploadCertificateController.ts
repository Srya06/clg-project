import { Request, Response, NextFunction } from 'express';
import { User, Certificate } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';
import certificateAnalyzer from '../../services/certificateAnalyzer';
import creditService from '../../services/creditService';
import logger from '../../utils/logger';

export const uploadCertificate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const studentId = req.user?.id;
    const file = req.file;

    if (!file) {
      return next(new AppError('Certificate file is required', 400));
    }

    // 1. Get student context for AI analysis
    const student = await User.findById(studentId);
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // 2. Convert buffer to base64 for Gemini Vision
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    try {
      logger.info(`Starting AI Analysis for certificate from ${student.email}`);
      
      // 3. Analyze with Gemini Vision
      const analysis = await certificateAnalyzer.analyze(
        base64Image, 
        mimeType, 
        student.careerGoal || "General Software Engineering"
      );

      // 4. Create certificate record
      const certificate = await Certificate.create({
        userId: studentId,
        courseName: analysis.courseName,
        provider: analysis.provider,
        issueDate: analysis.issueDate ? new Date(analysis.issueDate) : undefined,
        certificateUrl: "uploaded_file_buffer", // In a real app, we'd upload to S3/Cloudinary first
        relevanceScore: analysis.relevanceScore,
        aiAnalysis: analysis.analysis,
        status: analysis.isAuthentic ? 'verified' : 'pending'
      });

      // 5. If verified, update credits immediately
      if (certificate.status === 'verified') {
        await creditService.updateStudentCredits(studentId as string);
      }

      res.status(201).json(
        new ApiResponse(201, {
          certificate,
          message: analysis.isAuthentic 
            ? 'Certificate verified and credits awarded!' 
            : 'Certificate uploaded and pending manual review.'
        })
      );
    } catch (error: any) {
      logger.error('Certificate processing failed:', error.message);
      return next(new AppError(`Failed to process certificate: ${error.message}`, 500));
    }
  }
);
