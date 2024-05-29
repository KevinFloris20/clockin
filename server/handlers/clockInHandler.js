const { validateUTCTimestamp } = require( '../apps/validation.js');
exports.handleClockIn = (req, res) => {
    const { clockTime } = req.body;

    console.log('clockTime:', clockTime);

    let { isValid, message } = validateUTCTimestamp(clockTime);

    console.log('isvalid:', isValid);
    console.log('msg:', message);
    
    if (!isValid) {
        return res.status(400).json({ message: message });
    }

    res.json({ data: clockTime, message: `Clocked In` });
};
