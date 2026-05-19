import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../../utils';

const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);

class UploadService {
  async saveFile(file: any, destination: string): Promise<string> {
    try {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const targetPath = path.join(destination, fileName);

      if (file.path) {
        await renameAsync(file.path, targetPath);
      }

      return fileName;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Error saving file: ${message}`);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Error deleting file: ${message}`);
      throw error;
    }
  }
}

export default new UploadService();
