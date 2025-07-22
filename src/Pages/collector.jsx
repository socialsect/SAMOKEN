import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const PostureAnalyzer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);

  const [posture, setPosture] = useState('Detecting...');
  const [facingMode, setFacingMode] = useState('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeDetector();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (detectorRef.current) {
      startCamera();
    }
  }, [facingMode]);

  const initializeDetector = async () => {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      detectorRef.current = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.LIGHTNING }
      );
      startCamera();
    } catch (err) {
      console.error('Error initializing detector:', err);
      setError('Failed to initialize the pose detector.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async () => {
    setLoading(true);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resizeCanvas();
          setLoading(false);
          detectPose();
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access failed. Please allow permissions and refresh.');
      setLoading(false);
    }
  };

  const resizeCanvas = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
  };

  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const processFrame = async () => {
      if (!detectorRef.current || !videoRef.current) return;

      const poses = await detectorRef.current.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const angle = calculateBackAngle(keypoints);

        if (angle !== null) {
          const postureCategory = categorizePosture(angle);
          setPosture(`${postureCategory} | Angle: ${angle.toFixed(1)}°`);
          drawVisualization(ctx, keypoints, postureCategory, angle);
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
    ctx.strokeStyle = '#CB0000';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Posture: ${postureLabel} | Angle: ${angle.toFixed(1)}°`, 10, 30);
  };

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
        Current Posture: <span style={{ fontWeight: 'bold' }}>{posture}</span>
      </h2>

      {loading && <p>Loading Camera & Model...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ margin: '12px 0' }}>
        <label htmlFor="facing-select">Switch Camera:</label>
        <select
          id="facing-select"
          onChange={(e) => setFacingMode(e.target.value)}
          value={facingMode}
          style={{
            margin: '10px',
            padding: '8px',
            fontSize: '1rem',
          }}
        >
          <option value="environment">📷 Back Camera</option>
          <option value="user">🤳 Front Camera</option>
        </select>
      </div>
      <div
  style={{
    position: 'relative',
    width: '90vw',
    maxWidth: '500px',
    aspectRatio: '1 / 1',
    margin: '20px auto',
    backgroundColor: 'black',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
  }}
>
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'none'
    }}
  />
  <canvas
    ref={canvasRef}
    style={{
      width: '100%',
      height: '100%',
    }}
  />
</div>
    </div>
  );
};
export default PostureAnalyzer;
