import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware';
import authorizeRole from '../middleware/roleMiddleware';
import * as aiController from '../controllers/ai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

// Student only routes
router.post('/chat', authorizeRole('student'), aiController.chat);
router.post('/generate-roadmap', authorizeRole('student'), aiController.generateRoadmap);
// router.post('/analyze-resume', authorizeRole('student'), upload.single('resume'), aiController.analyzeResume);
router.get('/recommend', authorizeRole('student'), aiController.recommendResources);

// Shared/Monitoring routes
router.get('/monitor/:studentId', authorizeRole('student', 'teacher', 'hod', 'admin'), aiController.monitorStudent);

export default router;
