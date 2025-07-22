import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const SMOOTHING_BUFFER_SIZE = 5;

const PostureAnalyzer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const smoothingBuffer = useRef([]);

  const [posture, setPosture] = useState('Detecting...');
  const [facingMode, setFacingMode] = useState('user');

  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      await tf.setBackend('webgl');
      try {
        const detectorConfig = {
          modelType: posedetection.movenet.modelType.LIGHTNING,
        };
        detectorRef.current = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          detectorConfig
        );
        await setupCamera();
        detectPose();
      } catch (err) {
        console.error('Detector init error:', err);
        setError('Pose detector failed to initialize.');
      }
    };

    init();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    setupCamera();
  }, [facingMode]);

  const setupCamera = async () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access failed. Please allow permissions and refresh.');
    }
  };

  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const processFrame = async () => {
      if (!video || video.readyState < 2) {
        requestAnimationFrame(processFrame);
        return;
      }

      const poses = await detectorRef.current.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const angle = calculateBackAngle(keypoints);

        if (angle !== null) {
          smoothingBuffer.current.push(angle);
          if (smoothingBuffer.current.length > SMOOTHING_BUFFER_SIZE) {
            smoothingBuffer.current.shift();
          }

          const smoothedAngle =
            smoothingBuffer.current.reduce((a, b) => a + b, 0) /
            smoothingBuffer.current.length;
          const postureCategory = categorizePosture(smoothedAngle);
          setPosture(postureCategory);
          drawVisualization(ctx, keypoints, postureCategory, smoothedAngle);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const getKeypoint = (keypoints, primary, fallback) => {
    const p = keypoints.find(k => k.name === primary && k.score > 0.6);
    return p || keypoints.find(k => k.name === fallback && k.score > 0.6);
  };

  const calculateBackAngle = (keypoints) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');
    if (!shoulder || !hip) return null;

    const dx = shoulder.x - hip.x;
    const dy = shoulder.y - hip.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) return null;

    const dot = dy * -1;
    const angleRad = Math.acos(dot / magnitude);
    return angleRad * (180 / Math.PI);
  };

  const categorizePosture = (angle) => {
    if (angle <= 10) return 'Upright';
    if (angle <= 25) return 'Normal';
    return 'Crouched';
  };

  const drawVisualization = (ctx, keypoints, postureLabel, angle) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');
    if (!shoulder || !hip) return;

    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(hip.x, hip.y);
    ctx.strokeStyle = 'aqua';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Posture: ${postureLabel} | Angle: ${angle.toFixed(1)}°`, 10, 30);

    drawArrow(ctx, hip, shoulder, 'red');
  };

  const drawArrow = (ctx, from, to, color) => {
    const headlen = 10;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle - Math.PI / 6),
      to.y - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headlen * Math.cos(angle + Math.PI / 6),
      to.y - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(to.x, to.y);
    ctx.fill();
  };

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <h2 style={{ fontSize: '1.2rem' }}>Current Posture: {posture}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label htmlFor="facing-select">Camera:</label>
      <select
        id="facing-select"
        onChange={(e) => setFacingMode(e.target.value)}
        value={facingMode}
        style={{
          margin: '10px',
          padding: '8px',
          fontSize: '1rem',
          maxWidth: '90%',
        }}
      >
        <option value="environment">📷 Back Camera</option>
        <option value="user">🤳 Front Camera</option>
      </select>

      <div style={{ position: 'relative', display: 'inline-block' }}>
      <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
    zIndex: 1,
  }}
/>

<canvas
  ref={canvasRef}
  width="640"
  height="480"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
  }}
/>

      </div>
    </div>
  );
};

export default PostureAnalyzer;
