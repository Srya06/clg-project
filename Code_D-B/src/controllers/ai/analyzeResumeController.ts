import { Request, Response, NextFunction } from 'express';
import { resumeAnalyzerService } from '../../services';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const analyzeResume = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let resumeText = req.body.resumeText;

    // If a file was uploaded, parse the PDF
    if (req.file) {
      try {
        if (!req.file.buffer || req.file.buffer.length === 0) {
          throw new AppError('Uploaded file buffer is empty', 400);
        }

        // Use require for pdf-parse to avoid ESM/CJS default import issues in TS
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdf = require('pdf-parse');
        const pdfData = await pdf(req.file.buffer);
        
        if (!pdfData || !pdfData.text) {
          throw new Error('PDF parsed but no text was extracted');
        }
        
        resumeText = pdfData.text;
        console.info(`Successfully parsed PDF: ${req.file.originalname} (${resumeText.length} chars)`);
      } catch (err) {
        console.error('Detailed PDF Parse Error:', err);
        return next(new AppError(`Failed to parse uploaded PDF file: ${err instanceof Error ? err.message : 'Unknown error'}`, 400));
      }
    }

    // If still no text, use a fallback
    if (!resumeText) {
      resumeText =
        'Software Engineer with 3 years of experience in React, Node.js, and MongoDB. Familiar with AWS.';
    }

    try {
      const analysis = await resumeAnalyzerService.analyzeFullResume(
        resumeText,
        req.body.targetRole || 'Software Developer'
      );

      res
        .status(200)
        .json(new ApiResponse(200, { analysis }, 'Resume analyzed successfully'));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Gemini Resume Analysis Error:', msg);
      return next(new AppError(`AI Resume Analysis Error: ${msg}`, 503));
    }
  }
);
