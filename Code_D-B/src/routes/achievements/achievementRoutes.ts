import { Router } from 'express';
import * as achievementController from '../../controllers/achievements/achievementController';
import { protect, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', achievementController.getAllAchievements);
router.get('/featured', achievementController.getFeaturedAchievements);

// Protected routes
router.use(protect);
router.post('/', restrictTo('admin', 'hod'), achievementController.createAchievement);

export default router;
