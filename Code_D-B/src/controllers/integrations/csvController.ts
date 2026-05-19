import { Request, Response } from 'express';
import { catchAsync, AppError } from '../../utils';
import { User, Attendance, Mark } from '../../models';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

/**
 * Upload Attendance CSV
 * Format: email, subject, date, status, semester
 */
export const uploadAttendance = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Please upload a CSV file', 400);
  }

  const results: any[] = [];
  const stream = Readable.from(req.file.buffer);

  await new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const summary = {
    total: results.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const row of results) {
    try {
      const student = await User.findOne({ email: row.email.toLowerCase(), role: 'student' });
      if (!student) {
        summary.failed++;
        summary.errors.push(`Student not found: ${row.email}`);
        continue;
      }

      await Attendance.create({
        studentId: student._id,
        subject: row.subject,
        date: new Date(row.date),
        status: row.status.toLowerCase() as 'present' | 'absent',
        semester: parseInt(row.semester),
        recordedBy: req.user._id,
      });

      summary.success++;
    } catch (err: any) {
      summary.failed++;
      summary.errors.push(`Error processing ${row.email}: ${err.message}`);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Attendance processing complete',
    summary,
  });
});

/**
 * Upload Marks CSV
 * Format: email, subject, type, score, maxScore, semester
 */
export const uploadMarks = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Please upload a CSV file', 400);
  }

  const results: any[] = [];
  const stream = Readable.from(req.file.buffer);

  await new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const summary = {
    total: results.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const row of results) {
    try {
      const student = await User.findOne({ email: row.email.toLowerCase(), role: 'student' });
      if (!student) {
        summary.failed++;
        summary.errors.push(`Student not found: ${row.email}`);
        continue;
      }

      await Mark.create({
        studentId: student._id,
        subject: row.subject,
        type: row.type.toLowerCase() as 'internal' | 'external' | 'assignment' | 'lab',
        score: parseFloat(row.score),
        maxScore: parseFloat(row.maxScore || '100'),
        semester: parseInt(row.semester),
        recordedBy: req.user._id,
      });

      summary.success++;
    } catch (err: any) {
      summary.failed++;
      summary.errors.push(`Error processing ${row.email}: ${err.message}`);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Marks processing complete',
    summary,
  });
});
