import React, { useRef, useState, useCallback, useEffect } from 'react';
import useBallTracker from '../hooks/useBallTracker';

const VideoBallAnalyzer = () => {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use a ref to track the running state to avoid dependency issues
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  // Process frame callback with proper state management
  const processFrame = useCallback(async (videoElement) => {
    if (!isRunningRef.current) return;
    
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      const response = await fetch("https://6c90d19bcbeb.ngrok-free.app/analyze", {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      setIsProcessing(false);
      
      // Only schedule next frame if still running
      if (isRunningRef.current) {
        requestAnimationFrame(() => processFrame(videoElement));
      }
    }
  }, []);

  // Toggle running state
  const toggleRunning = useCallback(() => {
    const newRunningState = !isRunningRef.current;
    setIsRunning(newRunningState);
    isRunningRef.current = newRunningState;
    
    if (newRunningState && videoRef.current) {
      // Start processing frames
      processFrame(videoRef.current);
    }
  }, [processFrame]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Set up video stream
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
    
    initCamera();
    
    return () => {
      // Clean up on unmount
      setIsRunning(false);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'black'
    }}>
      <div 
        ref={videoContainerRef}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)' // Mirror the video for more natural feel
          }} 
        />
      </div>

      {/* Overlay Content */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none' /* This allows clicks to pass through to the video */
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'auto' /* Re-enable pointer events for interactive elements */
        }}>
          <h1 style={{ 
            color: 'white', 
            margin: 0,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>🏌️‍♂️ Golf Ball Tracker</h1>
          
          {/* Camera Controls */}
          <div style={{ 
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
            pointerEvents: 'auto'
          }}>
            <button 
              onClick={toggleRunning}
              disabled={isProcessing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isRunning ? 'rgba(231, 76, 60, 0.8)' : 'rgba(46, 204, 113, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                backdropFilter: 'blur(4px)'
              }}
            >
              {isRunning ? 'Stop Tracking' : 'Start Tracking'}
            </button>
            
            <button
              onClick={toggleFullscreen}
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                fontSize: '1.5rem',
                backdropFilter: 'blur(4px)',
                pointerEvents: 'auto'
              }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? '⤵️' : '⤴️'}
            </button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}>
            Analyzing...
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div style={{ 
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.8rem 1.5rem',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p style={{ margin: '0.3rem 0', fontSize: '1.1rem' }}>
              <span>Ball: </span>
              <span style={{ 
                color: result.detected ? '#2ecc71' : '#e74c3c',
                fontWeight: 'bold'
              }}>
                {result.detected ? '✅ Detected' : '❌ Not Detected'}
              </span>
            </p>
            {result.direction && (
              <p style={{ margin: '0.3rem 0', fontSize: '1.1rem' }}>
                <span>Direction: </span>
                <span style={{ fontWeight: 'bold' }}>{result.direction}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoBallAnalyzer;