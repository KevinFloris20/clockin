const express = require('express');
const router = express.Router();

const { handleClockIn } = require('./handlers/clockInHandler.js');
router.post('/clockin', handleClockIn);

const { handleBreak } = require('./handlers/breakClockHandler.js');
router.post('/break', handleBreak);


module.exports = router;
