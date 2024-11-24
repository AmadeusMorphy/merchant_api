const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductsByMerchant } = require('../controllers/productController');
const { authMiddleware, isMerchant } = require('../middleware/auth');

// Define routes with proper middleware and handlers
router.get('/', getProducts);
router.post('/', authMiddleware, isMerchant, createProduct);
router.get('/merchant', authMiddleware, getProductsByMerchant);

module.exports = router;