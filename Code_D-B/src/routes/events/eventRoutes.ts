import { Router } from 'express';
import * as eventController from '../../controllers/events/eventController';
import { protect, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', eventController.getAllEvents);

// Protected routes
router.use(protect);
router.post('/', restrictTo('admin', 'hod'), eventController.createEvent);
router.patch('/:id/archive', restrictTo('admin', 'hod'), eventController.archiveEvent);

export default router;
