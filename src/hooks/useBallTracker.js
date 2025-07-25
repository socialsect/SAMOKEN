import { useCallback, useState, useRef, useEffect } from 'react';

const API_URL = "https://bdc7c8dbd257.ngrok-free.app/analyze";

export default function useBallTracker() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const lastProcessedTime = useRef(0);
  const frameInterval = 200; // 5 FPS = 200ms per frame
  const isProcessingRef = useRef(false);

  const processFrame = useCallback(async (videoElement) => {
    if (!videoElement || isProcessingRef.current) return null;
    
    const now = Date.now();
    if (now - lastProcessedTime.current < frameInterval) {
      return null; // Skip if not enough time has passed for 5 FPS
    }
    
    lastProcessedTime.current = now;
    isProcessingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
        // ✅ Use FormData instead of raw binary
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");
      
        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });
      
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      
        const data = await response.json();
        setResult(data);
        return data;
      } catch (err) {
        console.error('Error processing frame:', err);
        setError(err.message || 'Error processing frame');
        throw err;
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    },[]);


  return {
    processFrame,
    isProcessing,
    error,
    result,
  };
}