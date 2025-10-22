const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyAccessToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if(!accessToken) return res.status(401).json({ message: 'Authorization token required' });

  try {
    const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = verifyAccessToken;