import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils';

/**
 * Role-Based Access Control middleware.
 *
 * Usage:
 *   router.get('/dashboard', protect, authorizeRole(USER_ROLE.HOD), controller);
 *   router.get('/profile',   protect, authorizeRole(USER_ROLE.STUDENT, USER_ROLE.HOD), controller);
 *
 * ALWAYS comes AFTER protect middleware so that req.user is already attached.
 *
 * @param  {...string} allowedRoles  - One or more role strings (use USER_ROLE enum).
 * @returns {Function}               - Express middleware function.
 */
const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Guard: authMiddleware must run first
    if (!req.user) {
      return next(
        new AppError('You are not logged in. Authentication required.', 401)
      );
    }

    // Guard: token must carry a role
    if (!req.user.role) {
      return next(
        new AppError('User role is not defined. Access denied.', 403)
      );
    }

    // Normalise to lowercase to prevent casing bugs
    const userRole = req.user.role.toLowerCase();
    const normalised = allowedRoles.map((r) => r.toLowerCase());

    if (!normalised.includes(userRole)) {
      return next(
        new AppError(
          `Forbidden: role '${userRole}' cannot access this resource. ` +
            `Allowed: [${normalised.join(', ')}].`,
          403
        )
      );
    }

    next();
  };
};

export default authorizeRole;
