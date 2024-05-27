const { validateUTCTimestamp } = require( '../apps/validation.js');
exports.handleClockIn = (req, res) => {
    const { clockTime } = req.body;

    let { isvalid, msg } = validateUTCTimestamp(clockTime);
    
    if (!isvalid) {
        return res.status(400).json({ message: msg });
    }

    res.json({ message: `Clock time logged: ${clockTime}` });
};
