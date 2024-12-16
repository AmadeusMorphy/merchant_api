const express = require('express');
const { getIPLocation } = require('../controllers/iplocationController');
const router = express.Router();

// Route for IP location
router.get('/', getIPLocation);

module.exports = router;