// Role-based authorization middleware

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is instructor or admin
export const isInstructorOrAdmin = (req, res, next) => {
  if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Instructor or admin access required'
    });
  }
  next();
};

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.resource?.[resourceUserIdField]?.toString();
    const currentUserId = req.user?._id?.toString();

    if (req.user?.role === 'admin' || resourceUserId === currentUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

export default { authorize, isAdmin, isInstructorOrAdmin, isOwnerOrAdmin };
