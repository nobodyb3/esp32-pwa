// Access phone sensors
let watchId;
let socket;

// Start sensor streaming
function startSensors() {
  // GPS
  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const data = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: Date.now()
        };
        if (socket) socket.send(JSON.stringify(data));
      },
      (error) => console.error("GPS Error:", error),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
  }

  // Accelerometer (if needed)
  if ("DeviceOrientationEvent" in window) {
    window.addEventListener("deviceorientation", (event) => {
      const tilt = {
        x: event.beta,  // Front-back tilt
        y: event.gamma, // Left-right tilt
        z: event.alpha  // Compass heading
      };
      if (socket) socket.send(JSON.stringify({ tilt }));
    });
  }
}

// Connect to ESP32 WebSocket
function connectESP32() {
  socket = new WebSocket("ws://ESP32_IP_ADDRESS:81");
  
  socket.onopen = () => {
    console.log("Connected to ESP32");
    startSensors(); // Start streaming data
  };
  
  socket.onerror = (err) => {
    console.error("WebSocket Error:", err);
  };
}

// Initialize
document.addEventListener("DOMContentLoaded", connectESP32);
