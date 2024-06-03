const { validateUTCTimestamp } = require( '../apps/validation.js');
const { interactWithFirestore } = require('../apps/firestoreApp.js');
exports.handleClockIn = (req, res) => {
    const { clockTime } = req.body;

    let { isValid, message } = validateUTCTimestamp(clockTime);
    
    if (!isValid) {
        return res.status(400).json({ message: message });
    }

    interactWithFirestore('setTime', { userId: 'Y9Ke1UJDvFnRXFySmAa5', clockTime: clockTime })

    res.json({ data: clockTime, message: `Clocked In` });
};
