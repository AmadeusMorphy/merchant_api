const express = require('express');
const router = express.Router();
const { getCurrentUser, getAllUsers, getMerchants, getAdmins, getCustomers, updateUser, patchUser, deleteUser, getUserById } = require('../controllers/userController');
const { authMiddleware, isAdmin, isMerchant, isAdminOrMerchant } = require('../middleware/auth');

// Route to get current user's information
router.get('/me', authMiddleware, getCurrentUser);

// Route to get all users (admin only)
router.get('/', authMiddleware, isAdmin, getAllUsers);

router.get('/profile', authMiddleware, isAdminOrMerchant, getUserById);

// Route to get all merchants (accessible to all authenticated users)
router.get('/customers', authMiddleware, isAdminOrMerchant, getCustomers);

router.get('/merchants', authMiddleware, isAdmin, getMerchants);

router.get('/admins', authMiddleware, isAdmin, getAdmins);

router.put('/profile', authMiddleware, isAdminOrMerchant, updateUser);

router.patch('/profile', authMiddleware, isAdminOrMerchant, patchUser);

router.delete('/profile', authMiddleware, isAdminOrMerchant, deleteUser);
module.exports = router;

