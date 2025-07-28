import { useCallback, useState, useRef, useEffect } from 'react';

// Hardcoded localhost URL for development
const API_URL = "http://localhost:8000/analyze";

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
      
        console.log('Sending request to server...');
        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });     
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          let errorText;
          try {
            const errorData = await response.json();
            errorText = JSON.stringify(errorData);
          } catch (e) {
            errorText = await response.text();
          }
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
      
        const data = await response.json();
        console.log('Received response data:', { 
          status: data.status, 
          hasProcessedImage: !!data.processed_image,
          direction: data.direction 
        });
        
        // Convert base64 image back to blob URL if needed
        if (data.processed_image) {
          try {
            // Remove any data URL prefix if present
            const base64Data = data.processed_image.split(';base64,').pop();
            const byteString = atob(base64Data);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < byteString.length; i++) {
              uint8Array[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            data.processed_image_url = URL.createObjectURL(blob);
            console.log('Successfully created image URL from response');
          } catch (imgError) {
            console.error('Error processing image data:', imgError);
            data.processed_image_url = null;
          }
        }
        
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