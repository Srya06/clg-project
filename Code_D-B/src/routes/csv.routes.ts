import { Router } from 'express';
import * as csvController from '../controllers/integrations/csvController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { handleCSVUpload } from '../middleware/fileUploadMiddleware';

const router = Router();

// All upload routes are protected and restricted to teachers/HODs/Admins
router.use(protect);
router.use(restrictTo('teacher', 'hod', 'admin'));

router.post(
  '/attendance',
  handleCSVUpload,
  csvController.uploadAttendance
);

router.post(
  '/marks',
  handleCSVUpload,
  csvController.uploadMarks
);

export default router;
