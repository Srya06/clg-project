import express from 'express';
import { protect } from '../middleware/authMiddleware';
import authorizeRole from '../middleware/roleMiddleware';
import { handleResumeUpload, handleCertificateUpload } from '../middleware/fileUploadMiddleware';
import validateRequest from '../validators/validateRequest';
import studentSchema from '../validators/schemas/studentSchema';
import roadmapSchema from '../validators/schemas/roadmapSchema';
import { studentController } from '../controllers';

const router = express.Router();

router.use(protect);
router.use(authorizeRole('student'));

// ... existing routes ...

/**
 * @swagger
 * /api/v1/student/profile:
 *   get:
 *     summary: Get logged-in student's profile
 *     tags: [Student]
 */
router.get('/profile', studentController.getProfile);

/**
 * @swagger
 * /api/v1/student/profile:
 *   put:
 *     summary: Update student profile
 *     tags: [Student]
 */
router.put(
  '/profile',
  validateRequest(studentSchema.updateProfile),
  studentController.updateProfile
);

/**
 * @swagger
 * /api/v1/student/resume:
 *   post:
 *     summary: Upload resume
 *     tags: [Student]
 */
router.post('/resume', handleResumeUpload, studentController.uploadResume);

/**
 * @swagger
 * /api/v1/student/resume/analyze:
 *   get:
 *     summary: Analyze resume
 *     tags: [Student]
 */
router.get('/resume/analyze', studentController.analyzeResume);

/**
 * @swagger
 * /api/v1/student/roadmap:
 *   get:
 *     summary: Get roadmap
 *     tags: [Student]
 */
router.get('/roadmap', studentController.getRoadmap);

/**
 * @swagger
 * /api/v1/student/roadmap/generate:
 *   post:
 *     summary: Generate roadmap
 *     tags: [Student]
 */
router.post(
  '/roadmap/generate',
  validateRequest(roadmapSchema.generateRoadmap),
  studentController.generateRoadmap
);

/**
 * @swagger
 * /api/v1/student/progress:
 *   get:
 *     summary: Get progress
 *     tags: [Student]
 */
router.get('/progress', studentController.getProgress);

/**
 * @swagger
 * /api/v1/student/progress:
 *   put:
 *     summary: Update progress
 *     tags: [Student]
 */
router.put(
  '/progress',
  validateRequest(roadmapSchema.updateProgress),
  studentController.updateProgress
);

/**
 * @swagger
 * /api/v1/student/score:
 *   get:
 *     summary: Get score
 *     tags: [Student]
 */
router.get('/score', studentController.getScore);

/**
 * @swagger
 * /api/v1/student/recommendations:
 *   get:
 *     summary: Get recommendations
 *     tags: [Student]
 */
router.get('/recommendations', studentController.getRecommendations);

/**
 * @swagger
 * /api/v1/student/announcements:
 *   get:
 *     summary: Get announcements
 *     tags: [Student]
 */
router.get('/announcements', studentController.getStudentAnnouncements);

/**
 * @swagger
 * /api/v1/student/certificate:
 *   post:
 *     summary: Upload and AI-analyze certificate
 *     tags: [Student]
 */
router.post('/certificate', handleCertificateUpload, studentController.uploadCertificate);

export default router;
