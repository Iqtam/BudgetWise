module.exports = function requireRole(allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user?.role;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (roles.includes(userRole)) return next();
      res.status(403).json({ error: 'Access denied' });
    };
  };