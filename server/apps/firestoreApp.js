// This app will take all timestamps from the client and store them in firestore, as well as return the timestamps to the client.
// all timestamps will be stored as utc time in firestore
// each document will represent a user and the main field will be the first name last name and phone number and the 
// first subfield will be called time and those are the timestamps
// odd is clock in and even is clock out, 
// a second subfield will be called break for the break timestamps same format as time
// a few functions in the file will be needed to build this app
// gettime, settime, getbreak, setbreak, removeTime, RemoveBreak, newuser, getuser
//
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: 'cred.env' });
const collectionId = process.env.COLLECTIONID.toString();
const dbName = process.env.DBNAME.toString();
const keyFilename = process.env.KEYFILE.toString();
const projectId = process.env.PROJECTID.toString();


// Helper function for error handling
function handleError(error, customMessage, data) {
    let detailedError = `${customMessage}\nError Details: ${error.message}`;
    if (error.response) {
        detailedError += `\nResponse Data: ${safeStringify(error.response.data)}`;
    }
    detailedError += `\nStack Trace: ${error.stack}`;
    console.log(detailedError, data);
    console.error(detailedError);
    return detailedError;
}

// Function to safely stringify error objects
function safeStringify(obj) {
    return JSON.stringify(obj, (key, value) => (typeof value === 'object' && value !== null ? undefined : value));
}

// Format Firestore value based on data type
function formatFirestoreValue(value) {
    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    } else if (typeof value === 'string') {
        return { stringValue: value };
    } else if (typeof value === 'boolean') {
        return { booleanValue: value };
    } else if (typeof value === 'number') {
        return { integerValue: value.toString() };
    } else if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(formatFirestoreValue) } };
    } else if (typeof value === 'object' && value !== null) {
        const fields = {};
        for (const [key, val] of Object.entries(value)) {
            fields[key] = formatFirestoreValue(val);
        }
        return { mapValue: { fields } };
    } else {
        console.error("Unsupported data type for Firestore:", typeof value);
    }
}

// Main function to interact with Firestore
async function interactWithFirestore(whatAreWeDoing, data) {
    try {
        const auth = new GoogleAuth({
            keyFilename: keyFilename,
            scopes: 'https://www.googleapis.com/auth/datastore'
        });

        const client = await auth.getClient();
        const accessToken = (await client.getAccessToken()).token;

        let headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'x-goog-request-params': `project_id=${projectId}&database_id=${dbName}`
        };

        switch (whatAreWeDoing) {
            case 'getTime':
                return await getTime(data.userId, headers);
            case 'setTime':
                return await setTime(data.userId, data.clockTime, headers);
            case 'getBreak':
                return await getBreak(data.userId, headers);
            case 'setBreak':
                return await setBreak(data.userId, data.breakTime, headers);
            case 'removeTime':
                return await removeTime(data.userId, data.timestamp, headers);
            case 'removeBreak':
                return await removeBreak(data.userId, data.timestamp, headers);
            case 'newUser':
                return await newUser(data.user, headers);
            case 'getUser':
                return await getUser(data.userId, headers);
            default:
                throw new Error('Unsupported operation: ' + whatAreWeDoing);
        }
    } catch (error) {
        handleError(error, 'Error in interactWithFirestore', data);
    }
}

// Firestore functions
async function getTime(userId, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        return handleError(error, 'Error in getTime', { userId });
    }
}



// async function setTime(userId, clockTime, headers) {
//     try {
//         const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
//         console.log('Fetching document from URL:', url); 
//         const docResponse = await axios.get(url, { headers });
//         const doc = docResponse.data;
//         let currentTimes = {};

//         if (doc.fields && doc.fields.time && doc.fields.time.mapValue && doc.fields.time.mapValue.fields) {
//             currentTimes = doc.fields.time.mapValue.fields;
//         }

//         const nextKey = (Object.keys(currentTimes).length + 1).toString();
//         console.log('Next key in sequence:', nextKey); 

//         clockTime = formatFirestoreValue(new Date(clockTime))
//         console.log("Clock " , clockTime)

//         console.log("Other: ", projectId, dbName, collectionId, userId)
//         const formattedData = {
//             time: {
//                 mapValue: {
//                     fields: {
//                         [nextKey]: clockTime
//                     }
//                 }
//             }
//         };
//         console.log(formattedData)
//         const fieldPaths = Object.keys(formattedData).join('&updateMask.fieldPaths=');
//         const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}?updateMask.fieldPaths=${fieldPaths}`;
//         const updatePayload = {
//             fields: formattedData
//         };
//         const updateResponse = await axios.patch(updateUrl, updatePayload, { headers });

//         console.log('Document updated successfully:', updateResponse.data); 
//         return updateResponse.data;
//     } catch (error) {
//         console.log(error)
//         return handleError(error, 'Error in setTime', { userId, clockTime });
//     }
// }// SetOptions(merge: true)


async function setTime(userId, clockTime, headers) {
    try {
        const documentData = await getTime(userId, headers);

        if (!documentData.fields){
            console.log('Document does not exist:', userId);
            return;
        }

        const existingArray = documentData.fields.time.arrayValue.values || []; 

        const formattedClockTime = formatFirestoreValue(new Date(clockTime));
        const updatedArray = [...existingArray, formattedClockTime]; 

        const updateData = {
            fields: {
                time: {
                    arrayValue: {
                        values: updatedArray
                    }
                }
            }
        };

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const fieldPaths = Object.keys(updateData.fields).join('&updateMask.fieldPaths=');
        const updateUrl = `${url}?updateMask.fieldPaths=${fieldPaths}`;

        const updateResponse = await axios.patch(updateUrl, updateData, { headers });

        console.log('Document updated successfully:', updateResponse.data);
        return updateResponse.data;
    }catch (error) {
        console.log(error);
        return handleError(error, 'Error in setTime', { userId, clockTime });
    }
  }

async function getBreak(userId, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const response = await axios.get(url, { headers });
        return response.data.fields.break.arrayValue.values;
    } catch (error) {
        return handleError(error, 'Error in getBreak', { userId });
    }
}

async function setBreak(userId, breakTime, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const doc = await axios.get(url, { headers });
        const existingBreaks = doc.data.fields.break ? doc.data.fields.break.arrayValue.values : [];
        existingBreaks.push({ timestampValue: breakTime });

        const data = {
            fields: {
                break: { arrayValue: { values: existingBreaks } }
            }
        };

        const response = await axios.patch(url, data, { headers });
        return response.data;
    } catch (error) {
        return handleError(error, 'Error in setBreak', { userId, breakTime });
    }
}

async function removeTime(userId, timestamp, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const doc = await axios.get(url, { headers });
        const existingTimes = doc.data.fields.time.arrayValue.values.filter(time => time.timestampValue !== timestamp);

        const data = {
            fields: {
                time: { arrayValue: { values: existingTimes } }
            }
        };

        const response = await axios.patch(url, data, { headers });
        return response.data;
    } catch (error) {
        return handleError(error, 'Error in removeTime', { userId, timestamp });
    }
}

async function removeBreak(userId, timestamp, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const doc = await axios.get(url, { headers });
        const existingBreaks = doc.data.fields.break.arrayValue.values.filter(time => time.timestampValue !== timestamp);

        const data = {
            fields: {
                break: { arrayValue: { values: existingBreaks } }
            }
        };

        const response = await axios.patch(url, data, { headers });
        return response.data;
    } catch (error) {
        return handleError(error, 'Error in removeBreak', { userId, timestamp });
    }
}

async function newUser(user, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}`;
        const data = {
            fields: {
                firstName: { stringValue: user.firstName },
                lastName: { stringValue: user.lastName },
                phoneNumber: { stringValue: user.phoneNumber },
                time: { arrayValue: { values: [] } },
                break: { arrayValue: { values: [] } }
            }
        };

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        return handleError(error, 'Error in newUser', { user });
    }
}

async function getUser(userId, headers) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbName}/documents/${collectionId}/${userId}`;
        const response = await axios.get(url, { headers });
        return response.data.fields;
    } catch (error) {
        return handleError(error, 'Error in getUser', { userId });
    }
}

module.exports = { interactWithFirestore };
