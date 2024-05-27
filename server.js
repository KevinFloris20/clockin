const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const route = require('./server/routes.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', route);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
