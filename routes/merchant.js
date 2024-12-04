const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  createMerchantProfile, 
  getMerchantProfile, 
  updateMerchantProfile, 
  deleteMerchantProfile, 
  getAllMerchants,
} = require('../controllers/merchantController');
const { authMiddleware, isMerchant, isAdmin, isAdminOrMerchant } = require('../middleware/auth');

// Validation middleware
const validateMerchantProfile = [
  body('email').isEmail().optional(),
  body('full_name').notEmpty().optional(),
  body('country').optional(),
  body('pfp_img').optional(),
  body('bg_img').optional(),
  body('products').optional().isArray(),
  body('stores').optional().isArray(),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Create merchant profile
router.post(
  '/profile', 
  authMiddleware, 
  isMerchant,
  validateMerchantProfile,
  createMerchantProfile
);

// Get merchant profile
router.get(
  '/profile', 
  authMiddleware, 
  getMerchantProfile
);

// GET ALL MERCHANTS
router.get(
    '/',
    authMiddleware,
    isAdmin,
    getAllMerchants
)

// Update merchant profile
router.put(
  '/profile', 
  authMiddleware,
  isAdminOrMerchant,
  validateMerchantProfile,
  updateMerchantProfile
);

// Partially update merchant profile
router.patch(
  '/profile', 
  authMiddleware,
  isAdminOrMerchant,
  updateMerchantProfile
);

// Delete merchant profile
router.delete(
  '/profile', 
  authMiddleware,
  isAdminOrMerchant,
  deleteMerchantProfile
);

module.exports = router;

