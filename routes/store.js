const express = require('express');
const router = express.Router();
const { authMiddleware, isMerchant } = require('../middleware/auth');
const { createStore, getStoreById } = require('../controllers/storeController');


// Define routes with proper middleware and handlers
router.post('/', authMiddleware, isMerchant, createStore);

router.get('/', authMiddleware, isMerchant, getStoreById);

module.exports = router;