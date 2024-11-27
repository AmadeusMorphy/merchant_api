const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check if the token is blacklisted
    const { data: blacklistedToken } = await supabase
      .from('blacklisted_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (blacklistedToken) {
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const isMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant') {
    return res.status(403).json({ error: 'Merchant access required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isMerchant
};