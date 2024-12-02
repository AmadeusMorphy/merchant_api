const express = require('express');
const router = express.Router();
const { getData, insertData } = require('../controllers/dataController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Define routes with proper middleware and handlers
router.get('/', authMiddleware, getData);
router.post('/', authMiddleware, isAdmin, insertData);

module.exports = router;