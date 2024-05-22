const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const clockInRoutes = require('./server/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', clockInRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
