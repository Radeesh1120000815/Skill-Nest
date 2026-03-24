
/**
 * roleMiddleware
 * Restricts route access to specific roles.
 * Must be used AFTER protect (requires req.user to be set).
 *
 * Usage examples:
 *   router.post('/upload', protect, authorizeRoles('STUDENT', 'LECTURER'), createResource)
 *   router.put('/approve/:id', protect, authorizeRoles('ADMIN'), approveResource)
 *
 * NOTE: The existing userModel uses 'junior'/'senior'/'both'.
 *       For the Resource module, roles are 'STUDENT', 'LECTURER', 'ADMIN'.
 *       Update userModel.js role enum accordingly (see userModel update note below).
 */

/**
 * authorizeRoles(...roles)
 * @param {...string} roles - allowed role values
 * Returns 403 if req.user.role is not in the allowed list.
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires one of: [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * adminOnly  — convenience shorthand
 */
export const adminOnly = authorizeRoles('ADMIN');

/**
 * lecturerOrAdmin — convenience shorthand
 */
export const lecturerOrAdmin = authorizeRoles('LECTURER', 'ADMIN');

/**
 * authenticatedUser — any logged-in role (STUDENT | LECTURER | ADMIN)
 */
export const authenticatedUser = authorizeRoles('STUDENT', 'LECTURER', 'ADMIN');
