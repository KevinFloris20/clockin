const { validateUTCTimestamp } = require( '../apps/validation.js');
exports.handleBreak = (req, res) => {
    const { breakClock } = req.body;

    let { isvalid, msg } = validateUTCTimestamp(breakClock);
    
    if (!isvalid) {
        return res.status(400).json({ message: msg });
    }

    res.json({ message: `Break time logged: ${breakClock}` });
};
