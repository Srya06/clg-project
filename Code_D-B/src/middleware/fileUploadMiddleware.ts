import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Ensure destination folder exists at startup
const RESUME_DIR = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(RESUME_DIR)) {
  fs.mkdirSync(RESUME_DIR, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESUME_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/octet-stream',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

const ALLOWED_EXTS = new Set(['.pdf', '.docx', '.doc']);

const fileFilter = (
  req: Request,
  file: any,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) || ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only PDF and DOCX files are allowed') as unknown as null,
      false
    );
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Middleware wrapper that catches Multer errors.
 */
export const handleResumeUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  uploadResume.single('resume')(req, res, (err: any) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error.',
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to upload file.',
    });
  });
};
/**
 * Certificate Upload (Memory Storage for AI processing)
 */
const certStorage = multer.memoryStorage();
const ALLOWED_CERT_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const certFileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_CERT_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed for certificates'), false);
  }
};

export const uploadCert = multer({
  storage: certStorage,
  fileFilter: certFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const handleCertificateUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadCert.single('certificate')(req, res, (err: any) => {
    if (!err) return next();
    return res.status(400).json({ success: false, message: err.message });
  });
};

/**
 * CSV Upload for Marks and Attendance
 */
const csvStorage = multer.memoryStorage();
const csvFileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

export const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB is plenty for CSV
});

export const handleCSVUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadCSV.single('file')(req, res, (err: any) => {
    if (!err) return next();
    return res.status(400).json({ success: false, message: err.message });
  });
};

