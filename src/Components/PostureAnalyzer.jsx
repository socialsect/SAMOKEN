import React, { useRef, useState, useEffect } from 'react';
import "../Styles/PostureAnalyzer.css";
import { Pose } from '@mediapipe/pose';

const PostureAnalyzer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [posture, setPosture] = useState(null);
  const [angle, setAngle] = useState(0);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [loading, setLoading] = useState(false); // loading state

  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        setError("Could not enumerate video devices.");
      }
    };
    getDevices();
  }, []);

  // Use the npm package directly
  const loadPoseModel = async () => {
    setLoading(true);
    const pose = new Pose({
      locateFile: (file) => `/pose/${file}` // expects assets in public/pose/
    });
    pose.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.75
    });
    pose.onResults(onResults);
    setLoading(false);
    return pose;
  };

  const onResults = (results) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Always sync canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks) {
      drawLandmarks(ctx, results.poseLandmarks);
      const calculatedAngle = calculateBackAngle(results.poseLandmarks);
      const label = classifyPosture(calculatedAngle);
      setAngle(calculatedAngle);
      setPosture(label);
      // drawPostureLabel(ctx, label, calculatedAngle); // REMOVE this line
    }
  };

  const drawLandmarks = (ctx, landmarks) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const nose = landmarks[0];
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };
    ctx.beginPath();
    ctx.moveTo(midHip.x * width, midHip.y * height);
    ctx.lineTo(nose.x * width, nose.y * height);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#00FF00';
    landmarks.forEach(lm => {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Remove drawPostureLabel from canvas drawing
  const drawPostureLabel = (ctx, posture, angle) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(20, 20, 250, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.fillText(`Posture: ${posture}`, 30, 45);
    ctx.fillText(`Angle: ${angle}°`, 30, 70);
  };

  const calculateBackAngle = (landmarks) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const nose = landmarks[0];
    if (!leftHip || !rightHip || !nose) return 0;
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
    const dx = nose.x - midHip.x;
    const dy = nose.y - midHip.y;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    angle = 90 - angle;
    return Math.abs(angle).toFixed(1);
  };

  const classifyPosture = (angle) => {
    const numAngle = parseFloat(angle);
    if (numAngle < 10) return 'Upright';
    else if (numAngle >= 10 && numAngle <= 30) return 'Normal';
    else return 'Crouched';
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });
      video.play();
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const pose = await loadPoseModel();
      setIsProcessing(true);
      const processVideo = async () => {
        if (!video.paused && !video.ended) {
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          await pose.send({ image: video });
          requestAnimationFrame(processVideo);
        }
      };
      requestAnimationFrame(processVideo);
    } catch (err) {
      console.error(err);
      setError("Failed to access camera or detect pose.");
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setIsProcessing(false);
    setPosture(null);
    setAngle(0);
  };

  return (
    <div className="posture-analyzer">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Loading model...</div>
        </div>
      )}
      <div className="posture-video-container" style={{ display: loading ? 'none' : 'block' }}>
        <div className="overlay-control overlay-top-right">
          <select
            value={selectedDeviceId}
            onChange={e => setSelectedDeviceId(e.target.value)}
            disabled={isProcessing}
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
        <video ref={videoRef} className="posture-video" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="posture-canvas" />
        <div className="overlay-control overlay-top-left">
          {!isProcessing ? (
            <button onClick={startCamera}>Start Camera</button>
          ) : (
            <button onClick={stopCamera}>Stop Camera</button>
          )}
        </div>
        {error && <p className="error overlay-top-left" style={{ top: 70, left: 20 }}>{error}</p>}
        {/* Modern metrics overlay at bottom center */}
        {isProcessing && (
          <div className="metrics-overlay">
            <div className="metrics-box">
              <div className="metrics-label">Posture</div>
              <div className="metrics-value">{posture || 'Detecting...'}</div>
            </div>
            <div className="metrics-box">
              <div className="metrics-label">Back Angle</div>
              <div className="metrics-value">{angle}°</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostureAnalyzer;