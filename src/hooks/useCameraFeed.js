import { useEffect, useRef, useState, useCallback } from "react";

export default function useCameraFeed(enabled = true) {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId) => {
    try {
      stopStream();
      const constraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'user' },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // If we don't have devices yet, get them
      if (devices.length === 0) {
        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Set initial device ID if not set
        if (!currentDeviceId && videoDevices.length > 0) {
          setCurrentDeviceId(deviceId || videoDevices[0].deviceId);
        }
      }
      
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      throw err;
    }
  }, [currentDeviceId, devices.length, stopStream]);

  const switchCamera = useCallback(async () => {
    if (devices.length < 2) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    try {
      await startStream(nextDeviceId);
      setCurrentDeviceId(nextDeviceId);
    } catch (err) {
      console.error("Failed to switch camera:", err);
    }
  }, [currentDeviceId, devices, startStream]);

  useEffect(() => {
    if (!enabled) {
      stopStream();
      return;
    }

    startStream(currentDeviceId);

    return () => {
      stopStream();
    };
  }, [enabled, currentDeviceId, startStream, stopStream]);

  return { videoRef, switchCamera, currentDeviceId };
}
