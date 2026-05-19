import express from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import hodRoutes from './hod.routes';
import aiRoutes from './ai.routes';
import integrationsRoutes from './integrations.routes';
import notificationsRoutes from './notifications.routes';
import healthRoutes from './health.routes';
import publicRoutes from './public.routes';
import eventRoutes from './events/eventRoutes';
import achievementRoutes from './achievements/achievementRoutes';
import csvRoutes from './csv.routes';

const router = express.Router();

router.use('/public', publicRoutes);
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/hod', hodRoutes);
router.use('/ai', aiRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/health', healthRoutes);
router.use('/events', eventRoutes);
router.use('/achievements', achievementRoutes);
router.use('/upload', csvRoutes);


export default router;
