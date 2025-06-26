// WebSocket connection
const socket = new WebSocket('ws://http://192.168.0.102/'); // Replace with ESP32 IP

// UI Elements
const forwardBtn = document.getElementById('forward');
const backwardBtn = document.getElementById('backward');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const stopBtn = document.getElementById('stop');
const gpsData = document.getElementById('gps-data');
const connectionStatus = document.getElementById('connection-status');
const speedDisplay = document.getElementById('speed');
const batteryLevel = document.getElementById('battery-level');
const batteryPercent = document.getElementById('battery-percent');

// Connection status
socket.onopen = () => {
    connectionStatus.textContent = '● Connected';
    connectionStatus.classList.add('connected');
    startSensorUpdates();
};

socket.onerror = (error) => {
    connectionStatus.textContent = '● Connection Error';
    connectionStatus.classList.remove('connected');
};

socket.onclose = () => {
    connectionStatus.textContent = '● Disconnected';
    connectionStatus.classList.remove('connected');
};

// Button controls
forwardBtn.addEventListener('touchstart', () => sendCommand('F'), {passive: true});
forwardBtn.addEventListener('touchend', () => sendCommand('S'), {passive: true});
backwardBtn.addEventListener('touchstart', () => sendCommand('B'), {passive: true});
backwardBtn.addEventListener('touchend', () => sendCommand('S'), {passive: true});
leftBtn.addEventListener('touchstart', () => sendCommand('L'), {passive: true});
leftBtn.addEventListener('touchend', () => sendCommand('S'), {passive: true});
rightBtn.addEventListener('touchstart', () => sendCommand('R'), {passive: true});
rightBtn.addEventListener('touchend', () => sendCommand('S'), {passive: true});
stopBtn.addEventListener('click', () => sendCommand('S'));

// For desktop
forwardBtn.addEventListener('mousedown', () => sendCommand('F'));
forwardBtn.addEventListener('mouseup', () => sendCommand('S'));
backwardBtn.addEventListener('mousedown', () => sendCommand('B'));
backwardBtn.addEventListener('mouseup', () => sendCommand('S'));
leftBtn.addEventListener('mousedown', () => sendCommand('L'));
leftBtn.addEventListener('mouseup', () => sendCommand('S'));
rightBtn.addEventListener('mousedown', () => sendCommand('R'));
rightBtn.addEventListener('mouseup', () => sendCommand('S'));

// Phone sensor data
function startSensorUpdates() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const data = {
                    type: "gps",
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    speed: position.coords.speed || 0,
                    heading: position.coords.heading || 0
                };
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(data));
                }
                gpsData.textContent = `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`;
                speedDisplay.textContent = (data.speed * 3.6).toFixed(1); // m/s to km/h
            },
            (error) => {
                gpsData.textContent = "GPS Error";
                console.error(error);
            },
            { enableHighAccuracy: true }
        );
    } else {
        gpsData.textContent = "GPS Not Supported";
    }
}

// Battery status
if ("getBattery" in navigator) {
    navigator.getBattery().then(battery => {
        updateBattery(battery.level * 100);
        battery.addEventListener('levelchange', () => {
            updateBattery(battery.level * 100);
        });
    });
} else {
    batteryPercent.textContent = "N/A";
}

function updateBattery(percent) {
    const level = Math.round(percent);
    batteryLevel.style.width = `${level}%`;
    batteryPercent.textContent = `${level}%`;
    
    if (level < 20) {
        batteryLevel.style.background = 'var(--danger)';
    } else if (level < 50) {
        batteryLevel.style.background = 'orange';
    } else {
        batteryLevel.style.background = 'var(--success)';
    }
}

function sendCommand(cmd) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(cmd);
    }
}
