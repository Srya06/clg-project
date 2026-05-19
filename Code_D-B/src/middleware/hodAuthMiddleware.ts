import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { AppError, catchAsync, logger } from '../utils';

/**
 * HOD-specific protect middleware.
 * - Verifies the JWT (same as protect)
 * - Additionally asserts that the authenticated user's role is exactly 'hod'
 * - Blocks students, teachers, and all other non-HOD roles with 403
 *
 * Usage: router.use(protectHod) — replaces `protect + authorizeRole('hod')`
 */
export const protectHod = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in. Authentication required.', 401));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User account no longer exists.', 401));
    }

    // ── RBAC: Allow HOD and Admin ──────────────────────────────────────────
    if (user.role !== 'hod' && user.role !== 'admin') {
      logger.warn(`[HOD Guard] Role '${user.role}' attempted HOD access (userId: ${user._id})`);
      return next(
        new AppError('Access denied. This resource is restricted to HOD personnel only.', 403)
      );
    }

    // ── SECURITY: Enforce Password Change ──────────────────────────────────
    // If forcePasswordChange is true, only allow the change-password endpoint
    if (user.forcePasswordChange && !req.originalUrl.endsWith('/auth/change-password')) {
      return next(
        new AppError('Action Required: You must change your password before accessing HOD resources.', 403)
      );
    }

    req.user = user;
    next();
  }
);
