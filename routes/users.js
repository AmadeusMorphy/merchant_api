const express = require('express');
const router = express.Router();
const { getCurrentUser, getAllUsers, getMerchants, getAdmins } = require('../controllers/userController');
const { authMiddleware, isAdmin, isMerchant, isAdminOrMerchant } = require('../middleware/auth');

// Route to get current user's information
router.get('/me', authMiddleware, getCurrentUser);

// Route to get all users (admin only)
router.get('/', authMiddleware, isAdmin, getAllUsers);

// Route to get all merchants (accessible to all authenticated users)
router.get('/merchants', authMiddleware, isAdminOrMerchant, getMerchants);

router.get('/admins', authMiddleware, isAdmin, getAdmins);

module.exports = router;

