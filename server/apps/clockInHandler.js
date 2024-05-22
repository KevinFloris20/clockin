exports.handleClockIn = (req, res) => {
    const { clockInTime } = req.body;


    // zzzzzzzzz
    res.json({ message: `Clock-in time logged: ${clockInTime}` });
};
