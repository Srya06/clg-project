class FileValidatorService {
  validateResumeFile(file?: Express.Multer.File): boolean {
    if (!file) {
      throw new Error('No file provided');
    }

    // Only allow PDFs based on env config or explicitly
    const allowedType = process.env.ALLOWED_RESUME_TYPES || 'application/pdf';

    if (file.mimetype !== allowedType) {
      throw new Error(`Only ${allowedType} files are allowed for resumes`);
    }

    return true;
  }

  checkFileSize(file: Express.Multer.File | undefined, maxSize: number): boolean {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new Error(`File size exceeds maximum allowed size of ${sizeMB} MB`);
    }

    return true;
  }
}

export default new FileValidatorService();
