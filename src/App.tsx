import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import testItem from './assets/testItem.png';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showCameraUI, setShowCameraUI] = useState(false);
  const [furniturePosition, setFurniturePosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const startCamera = () => {
    setShowCameraUI(true);
  };

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
      }
    };

    if (showCameraUI) {
      enableCamera();
    }
  }, [showCameraUI]);

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        const img = document.getElementById('furniture-item') as HTMLImageElement;
        if (img) {
          ctx.drawImage(img, furniturePosition.x, furniturePosition.y, 150, 150);
        }

        const link = document.createElement('a');
        link.download = 'snapshot.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - furniturePosition.x,
      y: e.clientY - furniturePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setFurniturePosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="container">
      <div className="furniture-container">
          <h1>Try This Furniture!</h1>
        <img src={testItem} alt="Image" className="furniture-img" />
        <button onClick={startCamera} disabled={showCameraUI}>
          Try
        </button>
      </div>

      {showCameraUI && (
        <div
          className="camera-container"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <video ref={videoRef} autoPlay playsInline muted className="video-feed" />
          <img
            id="furniture-item"
            src={testItem}
            alt="Furniture"
            className="furniture-overlay"
            onMouseDown={handleMouseDown}
            style={{
              left: `${furniturePosition.x}px`,
              top: `${furniturePosition.y}px`,
            }}
          />
          <button className="capture-btn" onClick={captureImage}>
            Save Image
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
};

export default App;
