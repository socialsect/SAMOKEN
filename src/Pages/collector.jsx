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

  useEffect(() => {
    const init = async () => {
      await tf.setBackend('webgl');
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.LIGHTNING,
      };
      detectorRef.current = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);
      await setupCamera();
      detectPose();
    };
    init();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setupCamera = async () => {
    const video = videoRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({

      video: {
        facingMode: { ideal: 'environment' } ,
        width: { ideal: 640 },
        height: { ideal: 480 } // fallback-friendly
      }
      
    });
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
  };

  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const processFrame = async () => {
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

          const smoothedAngle = smoothingBuffer.current.reduce((a, b) => a + b, 0) / smoothingBuffer.current.length;
          console.log('Smoothed Back Angle to Vertical:', smoothedAngle.toFixed(2));

          const postureCategory = categorizePosture(smoothedAngle);
          setPosture(postureCategory);

          drawVisualization(ctx, keypoints, postureCategory, smoothedAngle);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  /** Helper to normalize keypoints */
  const normalizeKeypoint = (point, videoWidth, videoHeight, canvasWidth, canvasHeight) => ({
    x: (point.x / videoWidth) * canvasWidth,
    y: (point.y / videoHeight) * canvasHeight
  });

  /** Fallback confidence check */
  const getKeypoint = (keypoints, primary, fallback) => {
    const primaryPoint = keypoints.find(kp => kp.name === primary && kp.score > 0.6);
    if (primaryPoint) return primaryPoint;
    return keypoints.find(kp => kp.name === fallback && kp.score > 0.6);
  };

  /** Dot Product based angle to vertical */
  const calculateBackAngle = (keypoints) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');

    if (!shoulder || !hip) return null;

    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;

    const normalizedShoulder = normalizeKeypoint(shoulder, vw, vh, cw, ch);
    const normalizedHip = normalizeKeypoint(hip, vw, vh, cw, ch);

    const dx = normalizedShoulder.x - normalizedHip.x;
    const dy = normalizedShoulder.y - normalizedHip.y;

    const backMagnitude = Math.sqrt(dx * dx + dy * dy);
    if (backMagnitude === 0) return null; // Prevent division by zero

    // Vertical vector is (0, -1)
    const dotProduct = (dx * 0) + (dy * -1);
    const angleRad = Math.acos(dotProduct / backMagnitude);
    const angleDeg = angleRad * (180 / Math.PI);

    console.log('Back Vector Angle to Vertical:', angleDeg.toFixed(2));
    return angleDeg;
  };

  /** Adjusted thresholds */
  const categorizePosture = (angle) => {
    if (angle <= 10) return 'Upright';
    if (angle <= 25) return 'Normal';
    return 'Crouched';
  };

  /** Draw posture line + vector arrow */
  const drawVisualization = (ctx, keypoints, postureLabel, angle) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');

    if (!shoulder || !hip) return;

    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;

    const normalizedShoulder = normalizeKeypoint(shoulder, vw, vh, cw, ch);
    const normalizedHip = normalizeKeypoint(hip, vw, vh, cw, ch);

    // Draw back line
    ctx.beginPath();
    ctx.moveTo(normalizedShoulder.x, normalizedShoulder.y);
    ctx.lineTo(normalizedHip.x, normalizedHip.y);
    ctx.strokeStyle = 'aqua';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw posture label
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Posture: ${postureLabel} | Angle: ${angle.toFixed(1)}°`, 10, 30);

    // Draw vector arrow
    drawArrow(ctx, normalizedHip, normalizedShoulder, 'lime');
  };

  /** Utility to draw an arrow between two points */
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
    ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(to.x, to.y);
    ctx.fill();
  };

  return (
    <div>
      <h2>Current Posture: {posture}</h2>
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default PostureAnalyzer;
