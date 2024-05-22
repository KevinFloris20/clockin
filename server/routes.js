const express = require('express');
const router = express.Router();
const { handleClockIn } = require('./apps/clockInHandler');

router.post('/clockin', handleClockIn);

module.exports = router;
