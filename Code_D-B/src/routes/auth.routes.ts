import express from 'express';
import authSchema from '../validators/schemas/authSchema';
import validateRequest from '../validators/validateRequest';
import { authController } from '../controllers';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: User successfully registered
 */
router.post(
  '/register',
  validateRequest(authSchema.register),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in
 *     tags: [Authentication]
 */
router.post('/login', validateRequest(authSchema.login), authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh token
 *     tags: [Authentication]
 */
router.post(
  '/refresh',
  validateRequest(authSchema.refreshToken),
  authController.refreshToken
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out
 *     tags: [Authentication]
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Authentication]
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 */
router.post('/reset-password/:token', authController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/update-password:
 *   patch:
 *     summary: Update password
 *     tags: [Authentication]
 */
router.patch('/update-password', protect, authController.updatePassword);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify email with OTP
 *     tags: [Authentication]
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @swagger
 * /api/v1/auth/resend-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Authentication]
 */
router.post('/resend-otp', authController.resendOtp);

export default router;
