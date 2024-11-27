const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty(),
  body('userType').isIn(['customer', 'merchant', 'admin'])
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // Blacklist the token
    const { error } = await supabase
      .from('blacklisted_tokens')
      .insert({ token });

    if (error) {
      return res.status(500).json({ error: 'Failed to blacklist token' });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
module.exports = router;

