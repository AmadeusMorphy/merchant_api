const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login } = require('../controllers/authController');

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

module.exports = router;

