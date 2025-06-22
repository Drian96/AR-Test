import React, { useRef, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  return (
    <div className="container">
      <h1>Try This Furniture!</h1>
      <div className="furniture-container">
        <img src="/src/assets/testItem.png" alt="Furniture" className="furniture-img" />
        <button onClick={startCamera}>Try</button>
      </div>

      {cameraOn && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay className="camera-video" />
          <img src="/src/assets/testItem.png" alt="Overlay Furniture" className="overlay-img" />
        </div>
      )}
    </div>
  );
};

export default App;
