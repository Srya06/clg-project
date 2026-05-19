import express from 'express';
import { protect } from '../middleware/authMiddleware';
import authorizeRole from '../middleware/roleMiddleware';
import { protectHod } from '../middleware/hodAuthMiddleware';
import { hodLoginLimiter } from '../middleware/rateLimitMiddleware';
import { hodController } from '../controllers';

const router = express.Router();

// ── HOD Authentication Routes (public — no protect middleware) ────────────────
router.post('/auth/login', hodLoginLimiter, hodController.hodLogin);
router.post('/auth/forgot-password', hodController.hodForgotPassword);
router.post('/auth/verify-reset-otp', hodController.hodVerifyResetOtp);

// ── HOD Protected Routes ──────────────────────────────────────────────────────
router.use(protect);
router.use(protectHod);

// Change password (requires being logged in as HOD)
router.post('/auth/change-password', hodController.hodChangePassword);

/**
 * @swagger
 * /api/v1/hod/students:
 *   get:
 *     summary: List all students with live scores
 *     tags: [HOD]
 */
router.get('/students', hodController.getStudents);

/**
 * @swagger
 * /api/v1/hod/students/{id}:
 *   get:
 *     summary: Get full profile + live score for a student
 *     tags: [HOD]
 */
router.get('/students/:id', hodController.getStudentDetail);
router.post('/students/:id/message', hodController.messageStudent);
router.post('/students/:id/intervention', hodController.triggerIntervention);


/**
 * @swagger
 * /api/v1/hod/rankings:
 *   get:
 *     summary: Student leaderboard sorted by score
 *     tags: [HOD]
 */
router.get('/rankings', hodController.getRankings);

/**
 * @swagger
 * /api/v1/hod/alerts:
 *   get:
 *     summary: Students requiring attention
 *     tags: [HOD]
 */
router.get('/alerts', hodController.getAlerts);

/**
 * @swagger
 * /api/v1/hod/analytics:
 *   get:
 *     summary: Department-wide aggregate analytics
 *     tags: [HOD]
 */
router.get('/analytics', hodController.getAnalytics);

/**
 * @swagger
 * /api/v1/hod/top-performers:
 *   get:
 *     summary: List top-performing students
 *     tags: [HOD]
 */
router.get('/top-performers', hodController.getTopPerformers);

/**
 * @swagger
 * /api/v1/hod/low-performers:
 *   get:
 *     summary: List low-performing students
 *     tags: [HOD]
 */
router.get('/low-performers', hodController.getLowPerformers);

/**
 * @swagger
 * /api/v1/hod/announcements:
 *   post:
 *     summary: Create an announcement
 *     tags: [HOD]
 */
router.post('/announcements', hodController.createAnnouncement);

/**
 * @swagger
 * /api/v1/hod/announcements:
 *   get:
 *     summary: List HOD's announcements
 *     tags: [HOD]
 */
router.get('/announcements', hodController.getAnnouncements);

/**
 * @swagger
 * /api/v1/hod/announcements/{id}:
 *   delete:
 *     summary: Archive an announcement
 *     tags: [HOD]
 */
router.delete('/announcements/:id', hodController.deleteAnnouncement);

/**
 * Events Management
 */
router.get('/events', hodController.getEvents);
router.post('/events', hodController.createEvent);
router.put('/events/:id', hodController.updateEvent);
router.delete('/events/:id', hodController.deleteEvent);

/**
 * Achievements Management
 */
router.get('/achievements', hodController.getAchievements);
router.post('/achievements', hodController.createAchievement);
router.put('/achievements/:id', hodController.updateAchievement);
router.delete('/achievements/:id', hodController.deleteAchievement);

export default router;
