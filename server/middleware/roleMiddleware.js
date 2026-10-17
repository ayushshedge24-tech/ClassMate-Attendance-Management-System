const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.userRole}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { authorize };
