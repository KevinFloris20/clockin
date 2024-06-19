// this app will handle everything related to user sessions
// not sure how to do all this yet

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { sendLoginEmail } = require('./emailAuthApp.js');
require('dotenv').config({ path: 'cred.env' });


const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.PROJECTID}/databases/(default)/documents`;

const handleLogin = async (req, res) => {
    const { firstName, lastName, email, companyPin } = req.body;

    try {
        const loginToken = uuidv4();
        const loginLink = `http://localhost:3000/auth/authenticate?token=${loginToken}`;

        const data = {
            fields: {
                firstName: { stringValue: firstName },
                lastName: { stringValue: lastName },
                email: { stringValue: email },
                companyPin: { stringValue: companyPin },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        };

        await axios.post(`${FIRESTORE_BASE_URL}/loginTokens?documentId=${loginToken}`, data);

        await sendLoginEmail(email, loginLink);
        res.send('Login email sent. Please check your inbox.');
    } catch (error) {
        console.error('Error sending login email:', error);
        res.status(500).send('Error sending login email');
    }
};

const handleAuthenticate = async (req, res) => {
    const { token } = req.query;

    try {
        const response = await axios.get(`${FIRESTORE_BASE_URL}/loginTokens/${token}`);
        const userInfo = response.data.fields;

        const sessionId = uuidv4();

        const sessionData = {
            fields: {
                ...userInfo,
                sessionId: { stringValue: sessionId },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        };

        await axios.post(`${FIRESTORE_BASE_URL}/sessions?documentId=${sessionId}`, sessionData);

        const sessions = await axios.get(`${FIRESTORE_BASE_URL}/sessions`);
        sessions.data.documents.forEach(async (doc) => {
            if (doc.fields.email.stringValue === userInfo.email.stringValue && doc.name.split('/').pop() !== sessionId) {
                await axios.delete(doc.name);
            }
        });

        res.cookie('sessionId', sessionId, { maxAge: 31536000000, httpOnly: true }); // Set session ID cookie with 1-year expiration
        res.send(`Authenticated! Your session ID is: ${sessionId}`);
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).send('Error authenticating user');
    }
};

//this is some middleware that will check if the user is authenticated
async function isAuthenticated(req, res, next){
    try {
        const sessionId = req.cookies.sessionId; 
        if (!sessionId) {
            return res.redirect('/login');
        }

        const response = await axios.get(`${FIRESTORE_BASE_URL}/sessions/${sessionId}`);
        if (response.data) {
            req.user = response.data.fields; 
            return next();
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }

    res.redirect('/login'); 
};

module.exports = { handleLogin, handleAuthenticate, isAuthenticated };
