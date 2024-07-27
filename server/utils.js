const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET,
   
  );
};

const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decoded; 
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(401).send({ message: 'Unauthorized' });
    }
  };
};
 


module.exports = { generateToken,  isAuth, hasRole,};
