const express = require('express');
const router = express.Router();
const { handleLogin, handleAuthenticate, isAuthenticated } = require('./authApp.js');

router.post('/login',isAuthenticated, handleLogin);
router.get('/authenticate',isAuthenticated, handleAuthenticate);

module.exports = router;
