const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Malformed token' });

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRole = decoded.rol_id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 1) { // 1 = Admin
    return res.status(403).json({ message: 'Require Admin Role' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
