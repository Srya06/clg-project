import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { User } from '../../models';
import { catchAsync, AppError, ApiResponse } from '../../utils';

export const analyzeResume = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?.id);

    if (!user || !user.resumeUrl) {
      return next(new AppError('Upload resume first', 400));
    }

    const filePath = path.join(__dirname, '../../../', user.resumeUrl);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Resume file not found on disk', 404));
    }

    const buffer = fs.readFileSync(filePath);
    let data: any;
    try {
      data = await (pdfParse as any)(buffer);
    } catch (parseError) {
      console.error('PDF Parsing Error:', (parseError as Error).message);
      return next(
        new AppError(
          'Failed to parse PDF content. Ensure file is a valid PDF.',
          422
        )
      );
    }

    const text = data.text.toLowerCase();

    const skillPool = [
      'javascript',
      'node',
      'react',
      'mongodb',
      'java',
      'python',
      'sql',
      'express',
      'html',
      'css',
    ];

    const foundSkills = skillPool.filter((skill) => text.includes(skill));

    const projectCount = (text.match(/project/g) || []).length;

    const score = Math.min(100, foundSkills.length * 10 + projectCount * 5);

    const result = {
      skills: foundSkills,
      projectCount,
      score,
      strengths: foundSkills.slice(0, 3),
      missingSkills: skillPool
        .filter((s) => !foundSkills.includes(s))
        .slice(0, 5),
    };

    user.resumeAnalysis = result;
    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Resume analyzed successfully'));
  }
);
