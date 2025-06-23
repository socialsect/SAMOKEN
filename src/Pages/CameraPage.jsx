import React, { useRef, useCallback } from "react";
import useCameraFeed from "../hooks/useCameraFeed";
import { FiCamera, FiCameraOff, FiChevronDown, FiCheck, FiRefreshCw } from "react-icons/fi";
import "./CameraPage.css";
import { useClickAway } from "react-use";

const CameraPage = () => {
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [showCameraList, setShowCameraList] = React.useState(false);
  const dropdownRef = useRef(null);
  
  const { 
    videoRef, 
    devices, 
    currentDeviceId, 
    switchToDevice, 
    isLoading 
  } = useCameraFeed(isCameraActive);
  
  // Close dropdown when clicking outside
  useClickAway(dropdownRef, () => {
    setShowCameraList(false);
  });
  
  const toggleCamera = useCallback(() => {
    setIsCameraActive(!isCameraActive);
  }, [isCameraActive]);
  
  const handleCameraSelect = async (deviceId) => {
    if (deviceId === currentDeviceId) {
      setShowCameraList(false);
      return;
    }
    
    const success = await switchToDevice(deviceId);
    if (success) {
      setShowCameraList(false);
    }
  };



  return (
    <div className="camera-container">
      <img
        src="Logos/THE RUNNER-LOGOS-01 (2).svg"
        alt="RUNNER Logo"
        className="camera-logo"
      />
      
      <div className="camera-preview">
        {isCameraActive ? (
          <video
            className="camera-video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="camera-placeholder">
            <FiCameraOff className="camera-icon" />
            <p>Camera is off</p>
          </div>
        )}
      </div>


      <div className="camera-controls">
        <button 
          className={`camera-button ${isCameraActive ? 'stop' : 'start'}`}
          onClick={toggleCamera}
        >
          {isCameraActive ? (
            <>
              <FiCameraOff className="button-icon" />
              Stop Camera
            </>
          ) : (
            <>
              <FiCamera className="button-icon" />
              Start Camera
            </>
          )}
        </button>
        {isCameraActive && (
          <div className="camera-switch-container" ref={dropdownRef}>
            <button 
              className="camera-button switch"
              onClick={() => setShowCameraList(!showCameraList)}
              title="Switch Camera"
              disabled={isLoading || devices.length <= 1}
            >
              <FiRefreshCw className={`button-icon ${isLoading ? 'animate-spin' : ''}`} />
              {devices.length <= 1 ? 'Only 1 Camera' : 'Switch Camera'}
              {devices.length > 1 && <FiChevronDown className="button-icon ml-1" />}
            </button>
            
            {showCameraList && devices.length > 1 && (
              <div className="camera-dropdown">
                {devices.map((device) => (
                  <button
                    key={device.deviceId}
                    className={`camera-dropdown-item ${currentDeviceId === device.deviceId ? 'active' : ''}`}
                    onClick={() => handleCameraSelect(device.deviceId)}
                    disabled={isLoading}
                  >
                    {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                    {currentDeviceId === device.deviceId && <FiCheck className="ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
