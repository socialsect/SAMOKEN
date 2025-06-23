import { useEffect, useRef, useState, useCallback } from "react";

export default function useCameraFeed(enabled = true) {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId) => {
    try {
      setIsLoading(true);
      stopStream();
      
      // If no deviceId is provided, use the default device
      const constraints = {
        video: deviceId 
          ? { 
              deviceId: { exact: deviceId },
              // Request specific facing mode to help with detection
              facingMode: { ideal: ['user', 'environment'] }
            }
          : {
              facingMode: { ideal: ['user', 'environment'] }
            },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Get the current track settings to determine camera type
        if (stream.getVideoTracks().length > 0) {
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          
          // Set a data attribute on the video element to indicate camera type
          const isFrontCamera = settings.facingMode === 'user' || 
                              (settings.facingMode === undefined && settings.facingMode !== 'environment');
          
          videoRef.current.setAttribute('data-camera-type', isFrontCamera ? 'front' : 'back');
          
          // Update current device ID if needed
          if (settings.deviceId && (!currentDeviceId || deviceId === settings.deviceId)) {
            setCurrentDeviceId(settings.deviceId);
          }
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [stopStream, currentDeviceId]);

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // First request camera access to ensure we get device labels
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        setDevices(videoDevices);
        
        // If we have devices but no current device is selected, select the first one
        if (videoDevices.length > 0 && !currentDeviceId) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    // Listen for device changes (cameras being connected/disconnected)
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    getDevices();
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [currentDeviceId]);

  // Switch to a specific camera by device ID
  const switchToDevice = useCallback(async (deviceId) => {
    if (!deviceId) return;
    
    try {
      await startStream(deviceId);
      setCurrentDeviceId(deviceId);
      return true;
    } catch (err) {
      console.error("Failed to switch to camera:", deviceId, err);
      return false;
    }
  }, [startStream]);

  // For backward compatibility, keep the switchCamera function that cycles through devices
  const switchCamera = useCallback(async () => {
    if (devices.length < 2) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    return switchToDevice(nextDeviceId);
  }, [currentDeviceId, devices, switchToDevice]);

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

  return { 
    videoRef, 
    switchCamera, 
    switchToDevice,
    currentDeviceId, 
    devices,
    isLoading 
  };
}
