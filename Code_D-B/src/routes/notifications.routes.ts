import express from 'express';
import { protect } from '../middleware/authMiddleware';
import authorizeRole from '../middleware/roleMiddleware';
import { notificationController } from '../controllers';

const router = express.Router();

router.use(protect);
router.use(authorizeRole('student', 'hod'));

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get notifications
 *     tags: [Notifications]
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/mark-all:
 *   put:
 *     summary: Mark all as read
 *     tags: [Notifications]
 */
router.put('/mark-all', notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   put:
 *     summary: Mark as read
 *     tags: [Notifications]
 */
router.put('/:id', notificationController.markAsRead);

export default router;
