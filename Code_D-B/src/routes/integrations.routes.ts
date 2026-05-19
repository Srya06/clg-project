import express from 'express';
import { protect } from '../middleware/authMiddleware';
import authorizeRole from '../middleware/roleMiddleware';
import validateRequest from '../validators/validateRequest';
import integrationSchema from '../validators/schemas/integrationSchema';
import { integrationController } from '../controllers';

const router = express.Router();

// 🔓 Unprotected routes (Callback handling)
/**
 * @swagger
 * /api/v1/integrations/github/callback:
 *   get:
 *     summary: GitHub OAuth callback handler
 *     tags: [Integrations]
 */
router.get('/github/callback', integrationController.githubCallback);

// 🔒 Protected routes (Requires Bearer token)
router.use(protect);

/**
 * @swagger
 * /api/v1/integrations/github/connect:
 *   get:
 *     summary: Initiate GitHub OAuth connection
 *     tags: [Integrations]
 */
router.get('/github/connect', integrationController.githubConnect);

router.use(authorizeRole('student'));

/**
 * @swagger
 * /api/v1/integrations/status:
 *   get:
 *     summary: Get user integration status
 *     tags: [Integrations]
 */
router.get('/status', integrationController.getIntegrationStatus);

/**
 * @swagger
 * /api/v1/integrations/github/sync:
 *   post:
 *     summary: Manually sync GitHub data
 *     tags: [Integrations]
 */
router.post(
  '/github/sync',
  validateRequest(integrationSchema.githubSync),
  integrationController.githubSync
);

/**
 * @swagger
 * /api/v1/integrations/leetcode/sync:
 *   post:
 *     summary: Manually sync LeetCode data
 *     tags: [Integrations]
 */
router.post(
  '/leetcode/sync',
  validateRequest(integrationSchema.leetcodeSync),
  integrationController.leetcodeSync
);

/**
 * @swagger
 * /api/v1/integrations/resources:
 *   get:
 *     summary: Get static learning resources
 *     tags: [Integrations]
 */
router.get('/resources', integrationController.getResources);

export default router;
