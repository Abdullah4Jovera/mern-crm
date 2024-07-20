const hasPermission = (requiredPermissions) => {
    return (req, res, next) => {
      const userPermissions = req.user.permissions || [];
  
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
  
      if (hasAllPermissions) {
        next();
      } else {
        res.status(403).send({ message: 'Forbidden' });
      }
    };
  };
  
  module.exports = hasPermission;
  