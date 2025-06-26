let socket;
let gpsWatchId;

// UI Elements
const connectionStatus = document.getElementById('connection-status');
const gpsData = document.getElementById('gps-data');
const speedDisplay = document.getElementById('speed');

function connectWebSocket() {
    const espIP = '192.168.0.102'; // Your ESP32's IP
    socket = new WebSocket(`ws://${espIP}:81`);

    socket.onopen = () => {
        connectionStatus.textContent = '● Connected';
        connectionStatus.className = 'connected';
        startGPS();
    };

    socket.onerror = (error) => {
        connectionStatus.textContent = '● Error';
        connectionStatus.className = 'error';
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        connectionStatus.textContent = '● Disconnected';
        connectionStatus.className = 'disconnected';
        setTimeout(connectWebSocket, 2000);
    };

    socket.onmessage = (event) => {
        console.log('Received:', event.data);
    };
}

function startGPS() {
    if (!navigator.geolocation) {
        gpsData.textContent = 'GPS not supported';
        return;
    }

    gpsWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const data = {
                type: 'gps',
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                speed: position.coords.speed || 0,
                accuracy: position.coords.accuracy
            };
            
            gpsData.textContent = `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`;
            speedDisplay.textContent = (data.speed * 3.6).toFixed(1); // m/s → km/h
            
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(data));
            }
        },
        (error) => {
            gpsData.textContent = `GPS Error: ${error.message}`;
        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000
        }
    );
}

// Button controls
document.getElementById('forward').addEventListener('mousedown', () => sendCommand('F'));
document.getElementById('forward').addEventListener('mouseup', () => sendCommand('S'));
document.getElementById('backward').addEventListener('mousedown', () => sendCommand('B'));
document.getElementById('backward').addEventListener('mouseup', () => sendCommand('S'));
document.getElementById('left').addEventListener('mousedown', () => sendCommand('L'));
document.getElementById('left').addEventListener('mouseup', () => sendCommand('S'));
document.getElementById('right').addEventListener('mousedown', () => sendCommand('R'));
document.getElementById('right').addEventListener('mouseup', () => sendCommand('S'));
document.getElementById('stop').addEventListener('click', () => sendCommand('S'));

// Touch support for mobile
document.getElementById('forward').addEventListener('touchstart', (e) => { e.preventDefault(); sendCommand('F'); }, {passive: false});
document.getElementById('forward').addEventListener('touchend', (e) => { e.preventDefault(); sendCommand('S'); }, {passive: false});
// (Repeat for other buttons...)

function sendCommand(cmd) {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(cmd);
    }
}

// Initialize
window.addEventListener('load', connectWebSocket);
