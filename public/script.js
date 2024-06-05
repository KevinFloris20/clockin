
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
        let x = document.getElementById('dateFilter').value || '24hrs';
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
function populateClockTimeTable(times){
    const tbody = document.getElementById('clockInTimes');
    tbody.innerHTML = '';
    times.forEach((time, index) => {
        const tr = document.createElement('tr');
        const countTd = document.createElement('td');
        const timeTd = document.createElement('td');
        
        countTd.textContent = index + 1;
        timeTd.textContent = time;

        tr.appendChild(countTd);
        tr.appendChild(timeTd);
        tbody.appendChild(tr);
    });
}
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
    populateClockTimeTable(filteredTimes)
    return filteredTimes;
}




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