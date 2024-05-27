//Async functions to interact with the server
async function clockIn() {
    try {
        const clockInTime = getCurrentUTCTime();

        const button = document.getElementById('clockInButton');
        const msgBox = document.getElementById('UImessage');
        loadingUI(button);
        clearErrorUI(msgBox);
        clearMessageUI(msgBox);

        const response = await fetch('/clockin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clockTime: clockInTime }),
        });

        const data = await response.json();
        console.log(response);
        console.log(data);

        if (response.ok) {
            addMessageUI(msgBox, data.message);
        } else {
            errorUI(msgBox, data.message);
        }

        loadedUI(button);
    } catch (err) {
        const button = document.getElementById('clockInButton');
        const msgBox = document.getElementById('UImessage');

        errorUI(msgBox, err.message);
        loadedUI(button);
    }
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

//set everything in dom
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('clockInButton').addEventListener('click', (event) => {
        event.preventDefault();
        clockIn();
    });

});