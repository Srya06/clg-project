import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health Check
 *     description: Returns the health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running perfectly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Code DB API is running perfectly!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Code DB API is running perfectly!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
