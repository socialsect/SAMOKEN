import React, { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import useBallTracker from '../hooks/useBallTracker';
import '../Styles/balltracker.css';

// Video constraints for different devices
const videoConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: 'environment',
  frameRate: { ideal: 30, max: 30 }
};

const BallTracker = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(5);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const detectionInterval = useRef(null);
  
  const { 
    processFrame, 
    isProcessing, 
    error, 
    result 
  } = useBallTracker();

  // Handle camera initialization
  const handleUserMedia = useCallback(() => {
    setCameraReady(true);
    setCameraError(null);
  }, []);

  const handleUserMediaError = useCallback((err) => {
    console.error('Error accessing camera:', err);
    setCameraError('Failed to access camera. Please check permissions and try again.');
    setCameraReady(false);
  }, []);

  // Handle frame processing
  const processVideoFrame = useCallback(async () => {
    if (!webcamRef.current || !isDetecting || !cameraReady) return;
    
    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) return; // Only process if video is ready

      await processFrame(video);
      
      if (result?.processed_image) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          // Maintain aspect ratio while fitting the container
          const container = canvas.parentElement;
          if (container) {
            const containerAspect = container.clientWidth / container.clientHeight;
            const imgAspect = img.width / img.height;
            
            let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
            
            if (imgAspect > containerAspect) {
              // Image is wider than container
              renderHeight = container.clientHeight;
              renderWidth = renderHeight * imgAspect;
              offsetX = (container.clientWidth - renderWidth) / 2;
            } else {
              // Image is taller than container
              renderWidth = container.clientWidth;
              renderHeight = renderWidth / imgAspect;
              offsetY = (container.clientHeight - renderHeight) / 2;
            }
            
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
          }
        };
        img.src = `data:image/jpeg;base64,${result.processed_image}`;
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    }
  }, [isDetecting, processFrame, result, cameraReady]);

  // Set up interval for frame processing
  useEffect(() => {
    if (isDetecting) {
      detectionInterval.current = setInterval(processVideoFrame, 1000 / fps);
    } else if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [isDetecting, fps, processVideoFrame]);

  // Toggle detection
  const toggleDetection = useCallback(() => {
    if (!cameraReady) {
      setCameraError('Camera is not ready. Please check permissions.');
      return;
    }
    setIsDetecting(prev => !prev);
  }, [cameraReady]);

  // Handle FPS change
  const handleFpsChange = (e) => {
    const newFps = parseInt(e.target.value, 10);
    if (newFps >= 1 && newFps <= 30) {
      setFps(newFps);
    }
  };

  // Handle window resize to maintain aspect ratio
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && webcamRef.current?.video) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (video.videoWidth && video.videoHeight) {
          const container = canvas.parentElement;
          const containerAspect = container.clientWidth / container.clientHeight;
          const videoAspect = video.videoWidth / video.videoHeight;
          
          let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
          
          if (videoAspect > containerAspect) {
            // Video is wider than container
            renderHeight = container.clientHeight;
            renderWidth = renderHeight * videoAspect;
            offsetX = (container.clientWidth - renderWidth) / 2;
          } else {
            // Video is taller than container
            renderWidth = container.clientWidth;
            renderHeight = renderWidth / videoAspect;
            offsetY = (container.clientHeight - renderHeight) / 2;
          }
          
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          
          // Only draw if we have a processed image
          if (result?.processed_image) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
            };
            img.src = `data:image/jpeg;base64,${result.processed_image}`;
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [result?.processed_image]);

  return (
    <div className="ball-tracker-container">
      <h1>Golf Ball Tracker</h1>
      
      <div className="video-container">
        <div className="webcam-wrapper">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam"
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            forceScreenshotSourceSize={true}
            mirrored={false}
          />
          <canvas
            ref={canvasRef}
            className="overlay-canvas"
          />
          {!cameraReady && !cameraError && (
            <div className="camera-loading">
              <div className="spinner"></div>
              <p>Initializing camera...</p>
            </div>
          )}
        </div>
      </div>
      
      {cameraError && (
        <div className="error-message">
          {cameraError}
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      <div className="controls">
        <button 
          onClick={toggleDetection}
          className={`detect-button ${isDetecting ? 'stop' : 'start'}`}
          disabled={isProcessing}
        >
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
          {isProcessing && <span className="processing-indicator">Processing...</span>}
        </button>
        
        <div className="fps-control">
          <label htmlFor="fps-slider">FPS: {fps}</label>
          <input
            id="fps-slider"
            type="range"
            min="1"
            max="30"
            value={fps}
            onChange={handleFpsChange}
            disabled={isDetecting}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {result?.direction && (
        <div className="direction-indicator">
          Ball direction: <span className="direction">{result.direction}</span>
        </div>
      )}
    </div>
  );
};

export default BallTracker;
