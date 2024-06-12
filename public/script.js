
//Async functions to interact with the server
async function clockIn() {
    try {
        const clockInTime = getCurrentUTCTime();

        const button = document.getElementById('clockInButton');
        const msgBox = document.getElementById('UImessage');
        loadingUI(button);
        clearErrorUI(msgBox);
        clearMessageUI(msgBox);

        const response = await fetch('/api/clockin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clockTime: clockInTime }),
        });

        const res = await response.json();

        let date = toMMDDYYYY(convertUTCToLocalTime(res.data));

        if (response.ok) {
            addMessageUI(msgBox, "Clock: " + date);
        } else {
            errorUI(msgBox, date);
        }
        showClockTimes();
        loadedUI(button);
    } catch (err) {
        const button = document.getElementById('clockInButton');
        const msgBox = document.getElementById('UImessage');

        errorUI(msgBox, err.message);
        loadedUI(button);
    }
}
async function getClockTimes() {
    try {
        //show loading ui
        const el = document.getElementById('clockInTimes')
        loadingUI(el);
        const response = await fetch('/api/times');
        const res = await response.json();
        console.log(res); 
        if (response.ok) {
            loadedUI(el);
            return res.data.fields;
        }else{
            loadedUI(el);
            errorUI(el, res.message);
        }
    } catch (err) {
        console.error(err);
    }
}
async function showClockTimes(){
    const userRes = getClockTimes();
    let times;
    return userRes.then(data => {
        times = Object.values(data.time.arrayValue.values).map(time => {
            return convertUTCToLocalTime(time.timestampValue);
        });
        populateClockTimeTable(times);
        getClockStatus(times);
        let x = document.getElementById('dateFilter').value || 'today';
        filterDates(x , times);
        return times;
    });
}

// helper functions
function getCurrentUTCTime() {
    return new Date().toISOString();
}
function convertUTCToLocalTime(utcTime) {
    return new Date(utcTime).toLocaleString();
}
function toMMDDYYYY(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let amOrPm = 'AM';

    if (seconds >= 30) {
        minutes++;
    }

    if (minutes >= 60) {
        minutes = 0;
        hours++;
    }

    if (hours >= 12) {
        amOrPm = 'PM';
        if (hours > 12) {
            hours -= 12;
        }
    } else if (hours === 0) {
        hours = 12;
    }

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    

    return `${month}/${day}/${year} - ${formattedHours}:${formattedMinutes} ${amOrPm}`;
}
function loadingUI(el){
    el.classList.add('loading');
    el.disabled = true;
}
function loadedUI(el){
    el.classList.remove('loading');
    el.disabled = false;
}
function errorUI(el, msg){
    el.classList.remove('hidden');
    el.classList.add('red');
    el.classList.add('error');
    el.innerText = msg;
}
function clearErrorUI(el){
    el.classList.add('hidden');
    el.classList.remove('red');
    el.classList.remove('error');
    el.innerText = '';
}
function addMessageUI(el, msg){
    el.classList.remove('hidden');
    el.classList.add('success');
    el.classList.add('green');
    el.innerText = msg;
}
function clearMessageUI(el){
    el.classList.add('hidden');
    el.classList.remove('success');
    el.classList.remove('green');
    el.innerText = '';
}
// function populateClockTimeTable(times){
//     const tbody = document.getElementById('clockInTimes');
//     tbody.innerHTML = '';
//     times.forEach((time, index) => {
//         const tr = document.createElement('tr');
//         const countTd = document.createElement('td');
//         const timeTd = document.createElement('td');

//         if(Math.floor(index / 2) % 2 !== 0) {
//             tr.classList.add('grey-background');
//         }
        
//         countTd.textContent = index + 1;
//         timeTd.textContent = time;

//         tr.appendChild(countTd);
//         tr.appendChild(timeTd);
//         tbody.appendChild(tr);
//     });

//     calculateTotalHours(times);
// }
function populateClockTimeTable(times) {
    const tbody = document.getElementById('clockInTimes');
    tbody.innerHTML = '';
    
    for (let i = 0; i < times.length; i += 2) {
        const start = new Date(times[i]);
        const end = i + 1 < times.length ? new Date(times[i + 1]) : null;
        
        const tr1 = document.createElement('tr');
        const tr2 = document.createElement('tr');
        const countTd1 = document.createElement('td');
        const countTd2 = document.createElement('td');
        const timeTd1 = document.createElement('td');
        const timeTd2 = document.createElement('td');
        
        if (Math.floor(i / 2) % 2 !== 0) {
            tr1.classList.add('grey-background');
            tr2.classList.add('grey-background');
        }

        countTd1.textContent = i + 1;
        timeTd1.textContent = times[i];
        
        if (end) {
            countTd2.textContent = i + 2;
            const diff = end - start;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            const totalHours = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timeTd2.innerHTML = `${times[i + 1]}<br><strong>Hours: ${totalHours}</strong>`;
        } else {
            countTd2.textContent = i + 2;
            timeTd2.textContent = '---';
        }
        
        tr1.appendChild(countTd1);
        tr1.appendChild(timeTd1);
        tr2.appendChild(countTd2);
        tr2.appendChild(timeTd2);
        tbody.appendChild(tr1);
        tbody.appendChild(tr2);
    }

    calculateTotalHours(times);
}
let clockStatt;
function getClockStatus(clockData){
    let clockStat;
    let clockBtnEl = document.getElementById('clockInButton');
    //remove display style from body
    document.body.classList.remove('hidden');
    if(clockData.length % 2 === 0){
        clockStat = 'In';
        clockBtnEl.classList.remove('yellow')
        clockBtnEl.classList.add('teal');
        clockBtnEl.innerText = 'Clock In';
        startTimer();
    }else{
        clockStat = 'Out';
        clockBtnEl.classList.remove('teal')
        clockBtnEl.classList.add('yellow');
        clockBtnEl.innerText = 'Clock Out';
        let val = clockData[clockData.length - 1];
        startTimer(val.split(' ')[1], val.split(' ')[2], true);
    }
    clockStatt = clockStat;
    return clockStat;
}
let timerInterval;
function startTimer(clockInTimeInput, AMorPM, out) {
    if (!out) {
        clearInterval(timerInterval);
        document.getElementById('elapsedTime').innerText = '00:00:00';
        return;
    }
    if (timerInterval){
        clearInterval(timerInterval);
    }

    const clockInTime = new Date();
    let [hours, minutes, seconds] = clockInTimeInput.split(':').map(Number);

    if (AMorPM === 'PM' && hours < 12) {
        hours += 12;
    } else if (AMorPM === 'AM' && hours === 12) {
        hours = 0;
    }

    clockInTime.setHours(hours, minutes, seconds, 0);

    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsedMilliseconds = now - clockInTime;

        const hoursElapsed = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
        const minutesElapsed = Math.floor((elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const secondsElapsed = Math.floor((elapsedMilliseconds % (1000 * 60)) / 1000);

        document.getElementById('elapsedTime').innerText = `${String(hoursElapsed).padStart(2, '0')}:${String(minutesElapsed).padStart(2, '0')}:${String(secondsElapsed).padStart(2, '0')}`;
    }, 1000);
}
function filterDates(filter, times) {
    const now = new Date();
    let filteredTimes;

    switch (filter) {
        case 'today':
            filteredTimes = times.filter(time => {
                const date = new Date(time);
                return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            });
            break;
        case '24hrs':
            filteredTimes = times.filter(time => {
                const date = new Date(time);
                return (now - date) <= 24 * 60 * 60 * 1000;
            });
            break;
        case '7days':
            filteredTimes = times.filter(time => {
                const date = new Date(time);
                return (now - date) <= 7 * 24 * 60 * 60 * 1000;
            });
            break;
        case '1month':
            filteredTimes = times.filter(time => {
                const date = new Date(time);
                return (now - date) <= 30 * 24 * 60 * 60 * 1000;
            });
            break;
        case '6months':
            filteredTimes = times.filter(time => {
                const date = new Date(time);
                return (now - date) <= 6 * 30 * 24 * 60 * 60 * 1000;
            });
            break;
        case 'all':
        default:
            filteredTimes = times;
            break;
    }

    //if the filtered times is an odd number and the mode isnt clock out, then add one more time from the end
    if (clockStatt === "In" && (filteredTimes.length % 2 !== 0)) {
        const firstFilteredIndex = times.indexOf(filteredTimes[0]);
        if (firstFilteredIndex > 0) {
            const lastUnfilteredTime = times[firstFilteredIndex - 1];
            filteredTimes.unshift(lastUnfilteredTime);
        }
    }

    populateClockTimeTable(filteredTimes)
    return filteredTimes;
}
function calculateTotalHours(times) {
    let totalMilliseconds = 0;

    for (let i = 0; i < times.length; i += 2) {
        const clockInTime = new Date(times[i]);
        const clockOutTime = new Date(times[i + 1]);

        if (!isNaN(clockInTime) && !isNaN(clockOutTime)) {
            totalMilliseconds += clockOutTime - clockInTime;
        }
    }

    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('totalHours').innerText = `Hours: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// function calculateTotalHours(times) {
//     console.log(times);
//     let totalMilliseconds = 0;

//     for (let i = 0; i < times.length; i += 2) {
//         const clockInTime = new Date(times[i]);
//         const clockOutTime = new Date(times[i + 1]);

//         if (!isNaN(clockInTime) && !isNaN(clockOutTime)) {
//             totalMilliseconds += clockOutTime - clockInTime;
//         }
//     }

//     const totalSeconds = Math.floor(totalMilliseconds / 1000);
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     //add a set interval elapsed time thats in the element id elapsedTime, to the total time
//     setInterval(() => {
//         let elapsed = document.getElementById('elapsedTime').innerText;
//         let [elapsedHours, elapsedMinutes, elapsedSeconds] = elapsed.split(':').map(Number);
//         elapsedHours += hours;
//         elapsedMinutes += minutes;
//         elapsedSeconds += seconds;
//         if (elapsedSeconds >= 60) {
//             elapsedMinutes++;
//             elapsedSeconds -= 60;
//         }
//         if (elapsedMinutes >= 60) {
//             elapsedHours++;
//             elapsedMinutes -= 60;
//         }
//         document.getElementById('totalHours').innerText = `Hours: ${String(elapsedHours).padStart(2, '0')}:${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;
//     }, 1000);



//     // document.getElementById('totalHours').innerText = `Hours: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
// }


//set everything in dom


document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('clockInButton').addEventListener('click', (event) => {
        event.preventDefault();
        clockIn();
    });

    //get times and print to console
    let times = await showClockTimes();

    //initialize dropdown
    $('.ui.dropdown').dropdown({
        onChange: function(value) {
            filterDates(value, times);
        }
    });




});