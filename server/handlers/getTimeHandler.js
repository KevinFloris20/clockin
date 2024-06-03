const { interactWithFirestore } = require('../apps/firestoreApp.js');
exports.handleGetTime = (req, res) => {

    const userId = 'Y9Ke1UJDvFnRXFySmAa5'

    interactWithFirestore('getTime', {userId: userId})
        .then(data => {
            res.json({ data: data, message: `Get time for ${userId}` });
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        });
};