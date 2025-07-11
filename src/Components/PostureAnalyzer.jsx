import React, { useRef, useState, useEffect } from 'react';
import "../Styles/PostureAnalyzer.css";
import { Pose } from '@mediapipe/pose';
import html2canvas from 'html2canvas';

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
  const [screenshot, setScreenshot] = useState(null);
  const [showSave, setShowSave] = useState(false);

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

  // Improved angle calculation (shoulder, hip, knee)
  const calculateHipAngle = (landmarks) => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const useRight = rightHip.x > leftHip.x;
    const hip = useRight ? landmarks[24] : landmarks[23];
    const knee = useRight ? landmarks[26] : landmarks[25];
    const shoulder = useRight ? landmarks[12] : landmarks[11];
    if (!hip || !knee || !shoulder) return 0;
    const a = Math.hypot(hip.x - knee.x, hip.y - knee.y);
    const b = Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y);
    const c = Math.hypot(shoulder.x - knee.x, shoulder.y - knee.y);
    // Law of cosines
    const angle = Math.acos((a*a + b*b - c*c) / (2*a*b)) * (180/Math.PI);
    return angle.toFixed(1);
  };

  // Enhanced overlay drawing with posture and angle labels on canvas
  const drawOverlay = (ctx, landmarks, angle, posture) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    // Decide which side is more visible (left or right)
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    // If right hip is further right on the image, use right side; else use left
    const useRight = rightHip.x > leftHip.x;
    const points = useRight ? [12, 24, 26, 28] : [11, 23, 25, 27]; // shoulder, hip, knee, ankle
    // Draw red lines: shoulder-hip, hip-knee, knee-ankle
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(landmarks[points[0]].x * width, landmarks[points[0]].y * height);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(landmarks[points[i]].x * width, landmarks[points[i]].y * height);
    }
    ctx.stroke();
    // Draw head circle
    ctx.beginPath();
    ctx.arc(landmarks[0].x * width, landmarks[0].y * height, 0.09 * width, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    // Draw angle arc at hip (always on inside of back)
    const hip = landmarks[points[1]];
    const knee = landmarks[points[2]];
    const shoulder = landmarks[points[0]];
    const cx = hip.x * width;
    const cy = hip.y * height;
    const v1 = { x: shoulder.x - hip.x, y: shoulder.y - hip.y };
    const v2 = { x: knee.x - hip.x, y: knee.y - hip.y };
    let start = Math.atan2(v1.y, v1.x);
    let end = Math.atan2(v2.y, v2.x);
    // Cross product to determine direction
    const cross = v1.x * v2.y - v1.y * v2.x;
    if (cross < 0) {
      // Swap start and end to always draw inside angle
      [start, end] = [end, start];
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 40, start, end, false);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Draw angle text near hip (GoodTimes font)
    ctx.save();
    ctx.font = 'bold 32px GoodTimes, Arial, sans-serif';
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    // Place label on the bisector of the angle
    const bisect = (start + end) / 2;
    ctx.fillText(`${angle}°`, cx + 60 * Math.cos(bisect), cy + 60 * Math.sin(bisect) - 10);
    ctx.restore();
    // Draw posture label at top center (GoodTimes font)
    ctx.save();
    ctx.font = 'bold 32px GoodTimes, Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(`${posture}`, width / 2, 48);
    ctx.restore();
  };

  const onResults = (results) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks) {
      const calculatedAngle = calculateHipAngle(results.poseLandmarks);
      const label = classifyPosture(calculatedAngle);
      drawOverlay(ctx, results.poseLandmarks, calculatedAngle, label);
      setAngle(calculatedAngle);
      setPosture(label);
    }
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

  // ANALYSE button handler (composite video + overlay)
  const handleAnalyse = async () => {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay) return;
    // Create a temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    // Draw video frame
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    // Draw overlay
    ctx.drawImage(overlay, 0, 0, tempCanvas.width, tempCanvas.height);
    // Export as image
    setScreenshot(tempCanvas.toDataURL('image/png'));
    setShowSave(true);
  };

  // Save screenshot
  const handleSave = () => {
    if (!screenshot) return;
    const link = document.createElement('a');
    link.href = screenshot;
    link.download = 'Runner.golf posture analyser.png';
    link.click();
  };

  return (
    <div className="posture-analyzer">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Loading model...</div>
        </div>
      )}
      <div className="posture-video-container" style={{ display: loading ? 'none' : 'block', position: 'relative' }}>
        {/* Show dropdown and Start Camera button only if not processing */}
        {!isProcessing && !screenshot && (
          <div className="pre-camera-ui">
            <select
              className="custom-dropdown"
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              style={{ marginBottom: 24 }}
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
            <button className="start-btn" onClick={startCamera}>Start Camera</button>
          </div>
        )}
        {/* Video and canvas always present */}
        <video ref={videoRef} className="posture-video" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="posture-canvas" />
        {/* Show Stop Camera button only if processing */}
        {isProcessing && !screenshot && (
          <button className="stop-btn" onClick={stopCamera}>Stop Camera</button>
        )}
        {/* Show Analyse button only if processing */}
        {isProcessing && !screenshot && (
          <div className="analyse-btn-container">
            <button className="analyse-btn" onClick={handleAnalyse}>ANALYSE</button>
          </div>
        )}
        {error && <p className="error overlay-top-left" style={{ top: 70, left: 20 }}>{error}</p>}
      </div>
      {screenshot && (
        <div className="screenshot-preview">
          <img src={screenshot} alt="Posture Analysis Screenshot" style={{ width: '100%', borderRadius: 16, marginTop: 16 }} />
          {showSave && <button className="save-btn" onClick={handleSave}>Save</button>}
        </div>
      )}
    </div>
  );
};

export default PostureAnalyzer;