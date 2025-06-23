import React from "react";
import { useState, useEffect } from "react";
import useCameraFeed from "../hooks/useCameraFeed";
import "./CameraPage.css";

const CameraPage = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useCameraFeed(isCameraActive);

  return (
    <div className="camera-container">
      <img
        src="Logos/THE RUNNER-LOGOS-01 (2).svg"
        alt="RUNNER Logo"
        className="camera-logo"
      />
      
      {!isCameraActive ? (
        <button 
          className="camera-button"
          onClick={() => setIsCameraActive(true)}
        >
          Start Camera
        </button>
      ) : (
        <>
          <video
            className="camera-video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: 'block' }}
          />
          <button 
            className="camera-button"
            onClick={() => setIsCameraActive(false)}
            style={{ marginTop: '20px' }}
          >
            Stop Camera
          </button>
        </>
      )}
    </div>
  );
};

export default CameraPage;
