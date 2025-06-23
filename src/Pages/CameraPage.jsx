import React, { useState } from "react";
import useCameraFeed from "../hooks/useCameraFeed";
import { FiCamera, FiCameraOff, FiRefreshCw } from "react-icons/fi";
import "./CameraPage.css";

const CameraPage = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const { videoRef, switchCamera } = useCameraFeed(isCameraActive);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
  };

  const handleSwitchCamera = () => {
    switchCamera();
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
          <button 
            className="camera-button switch"
            onClick={handleSwitchCamera}
            title="Switch Camera"
          >
            <FiRefreshCw className="button-icon" />
            Switch
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
