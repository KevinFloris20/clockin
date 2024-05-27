// you know we finna validate these inputs

function validateUTCTimestamp(input) {
    if (typeof input !== 'string') {
        return { isValid: false, message: 'Input is not a string' };
    }
    const iso8601Regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z)$/;

    if (!iso8601Regex.test(input)) {
        return { isValid: false, message: 'Input is not a valid a timestamp' };
    }

    const date = new Date(input);
    if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Input is not a valid date' };
    }

    if (date.toISOString() !== input) {
        return { isValid: false, message: 'Too much data' };
    }

    return { isValid: true, message: 'Valid UTC timestamp' };
}

module.exports = {
    validateUTCTimestamp
};