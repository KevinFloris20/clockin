document.getElementById('clockInButton').addEventListener('click', (event) => {
    event.preventDefault();
    const clockInTime = new Date().toLocaleString();
    console.log(`Clocked in at: ${clockInTime}`);
  
    fetch('/api/clockin', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clockInTime }),
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Error:', error));
});
  