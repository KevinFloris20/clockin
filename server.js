const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const route = require('./server/routes.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/other')))
app.get('/public/other/site.webmanifest', (req, res) => {
    res.type('application/manifest+json');
    res.sendFile(path.join(__dirname, '..', 'public', 'other', 'site.webmanifest'));
});
app.use('/', route);






app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
