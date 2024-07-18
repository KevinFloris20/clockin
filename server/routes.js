const express = require('express');
const router = express.Router();
const path = require('path');

// //login page
// router.post('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public/login.html'));
// });


// //get authentification
// const { isAuthenticated } = require('./apps/auth/authApp.js');


// //auth
// const authRoute = require('./apps/auth/authRoutes.js');
// router.use('/auth', authRoute);


// router.get('/', isAuthenticated, (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public/index.html'));
// });


// const { handleClockIn } = require('./handlers/clockInHandler.js');
// router.post('/clockin', isAuthenticated, handleClockIn);

// // const { handleBreak } = require('./handlers/breakClockHandler.js');
// // router.post('/break', isAuthenticated, handleBreak);

// const { handleGetTime } = require('./handlers/getTimeHandler.js');
// router.get('/times', isAuthenticated, handleGetTime);



//serve all the handlers
const { handleClockIn } = require('./handlers/clockInHandler.js');
router.post('/clockin', handleClockIn);

const { handleBreak } = require('./handlers/breakClockHandler.js');
router.post('/break', handleBreak);

const { handleGetTime } = require('./handlers/getTimeHandler.js');
router.get('/times', handleGetTime);



module.exports = router;
