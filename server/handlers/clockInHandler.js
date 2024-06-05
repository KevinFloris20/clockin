const { validateUTCTimestamp } = require( '../apps/validation.js');
const { interactWithFirestore } = require('../apps/firestoreApp.js');
exports.handleClockIn = async (req, res) => {
    const { clockTime } = req.body;

    let { isValid, message } = await validateUTCTimestamp(clockTime);
    
    if (!isValid) {
        return res.status(400).json({ message: message });
    }

    const {data, status} = await interactWithFirestore('setTime', { userId: 'Y9Ke1UJDvFnRXFySmAa5', clockTime: clockTime })

    if (!data || status !== 200) {
        console.log('Error saving time: ' + status);
        return res.status(500).json({ message: `Error saving time: ${status}` });
    }

    res.json({ data: clockTime, message: `Clocked In` });
};
