import express from 'express';
import * as publicController from '../controllers/publicController';

const router = express.Router();

router.get('/events', publicController.getPublicEvents);
router.get('/achievements', publicController.getPublicAchievements);

export default router;
