// This app will take all timestamps from the client and store them in firestore, as well as return the timestamps to the client.
// all timestamps will be stored as utc time in firestore
// each document will represent a user and the main field will be the first name last name and phone number and the 
// first subfield will be called time and those are the timestamps
// odd is clock in and even is clock out, 
// a second subfield will be called break for the break timestamps same format as time
// a few functions in the file will be needed to build this app
// gettime, settime, getbreak, setbreak, removeTime, RemoveBreak, newuser, getuser
//
