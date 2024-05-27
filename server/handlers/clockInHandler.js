const { validateUTCTimestamp } = require( '../apps/validation.js');
exports.handleClockIn = (req, res) => {
    const { clockTime } = req.body;

    console.log('clockTime:', clockTime);

    let { isvalid, msg } = validateUTCTimestamp(clockTime);

    console.log('isvalid:', isvalid);
    console.log('msg:', msg);
    
    if (!isvalid) {
        return res.status(400).json({ message: msg });
    }

    res.json({ message: `Clock time logged: ${clockTime}` });
};
