import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import testItem from './assets/testItem.png';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showCameraUI, setShowCameraUI] = useState(false);
  const [furniturePosition, setFurniturePosition] = useState({ x: 0, y: 0 });
  const [furnitureSize, setFurnitureSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = () => {
    setShowCameraUI(true);
  };

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        streamRef.current = stream;
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
  }, [showCameraUI, facingMode]);

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        const img = document.getElementById('furniture-item') as HTMLImageElement;
        if (img) {
          ctx.drawImage(
            img,
            furniturePosition.x,
            furniturePosition.y,
            furnitureSize.width,
            furnitureSize.height
          );
        }

        const link = document.createElement('a');
        link.download = 'snapshot.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
      }

      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCameraUI(false);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleResize = (e: React.ChangeEvent<HTMLInputElement>, axis: 'width' | 'height') => {
    const value = parseInt(e.target.value);
    if (axis === 'width') setFurnitureSize((prev) => ({ ...prev, width: value }));
    if (axis === 'height') setFurnitureSize((prev) => ({ ...prev, height: value }));
  };

  return (
    <div className="container">

      <div className="furniture-container">
          <h1>Try This Furniture! #2</h1>
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

          <div
            className="furniture-overlay"
            onMouseDown={handleMouseDown}
            style={{
              left: `${furniturePosition.x}px`,
              top: `${furniturePosition.y}px`,
              width: `${furnitureSize.width}px`,
              height: `${furnitureSize.height}px`,
            }}
          >
            <img
              id="furniture-item"
              src={testItem}
              alt="Furniture"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="button-group">
            <button className="capture-btn" onClick={captureImage}>
              Save Image
            </button>
            <button className="switch-btn" onClick={switchCamera}>
              Rotate Camera
            </button>
          </div>

          <div className="resize-controls">
            <label>
              Width:
              <input
                type="range"
                min="50"
                max={window.innerWidth}
                value={furnitureSize.width}
                onChange={(e) => handleResize(e, 'width')}
              />
            </label>
            <label>
              Height:
              <input
                type="range"
                min="50"
                max={window.innerHeight}
                value={furnitureSize.height}
                onChange={(e) => handleResize(e, 'height')}
              />
            </label>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
};

export default App;
