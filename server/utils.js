const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
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
 
const isCEO = hasRole(['CEO']);
const isMD = hasRole(['MD']);
const isSuperAdmin = hasRole(['superadmin']);
const isUser = hasRole(['user']);

const isPLM = hasRole(['personalloanmanger']);
const isBFM = hasRole(['businessfinanceloanmanger']);
const isRELM = hasRole(['realestateloanmanger']);
const isMLM = hasRole(['mortgageloanmanger']);

const isPLHOD = hasRole(['personalloanHOD']);
const isBFHOD = hasRole(['businessfinanceloanHOD']);
const isRELHOD = hasRole(['realestateloanHOD']);
const isMLHOD = hasRole(['mortgageloanHOD']);

const isPLC = hasRole(['personalloancordinator']);
const isBFC = hasRole(['businessfinanceloancordinator']);
const isRELC = hasRole(['realestateloancordinator']);
const isMLC = hasRole(['mortgageloancordinator']);

const isPLTL = hasRole(['personalloanteamleader']);
const isBFTL = hasRole(['businessfinanceloanteamleader']);
const isRETL = hasRole(['realestateloanteamleader']);
const isMTL = hasRole(['mortgageloanteamleader']);

const isPLS = hasRole(['personalloansales']);
const isBFS = hasRole(['businessfinanceloansales']);
const isRELS = hasRole(['realestateloansales']);
const isMLS = hasRole(['mortgageloansales']);

module.exports = { generateToken, isUser,isCEO,isMD, isAuth, hasRole, isPLM, isSuperAdmin, isBFM, isRELM, isMLM,
  isPLHOD,isBFHOD,isRELHOD,isMLHOD,isPLC,isBFC,isRELC,isMLC,
  isPLTL,isBFTL,isRETL,isMTL,
  isPLS,isBFS,isRELS,isMLS
 };
