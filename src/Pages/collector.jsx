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
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
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
          console.log('Detected Back Angle:', angle.toFixed(2));
          smoothingBuffer.current.push(angle);
          if (smoothingBuffer.current.length > SMOOTHING_BUFFER_SIZE) {
            smoothingBuffer.current.shift();
          }

          const smoothedAngle = smoothingBuffer.current.reduce((a, b) => a + b, 0) / smoothingBuffer.current.length;
          const postureCategory = categorizePosture(smoothedAngle);
          setPosture(postureCategory);

          drawVisualization(ctx, keypoints, postureCategory);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  /** Normalizing Keypoints for canvas **/
  const normalizeKeypoint = (point, videoWidth, videoHeight, canvasWidth, canvasHeight) => ({
    x: (point.x / videoWidth) * canvasWidth,
    y: (point.y / videoHeight) * canvasHeight
  });

  /** Fallback to right side if left side confidence is low **/
  const getKeypoint = (keypoints, primary, fallback) => {
    const first = keypoints.find(kp => kp.name === primary && kp.score > 0.6);
    if (first) return first;
    return keypoints.find(kp => kp.name === fallback && kp.score > 0.6);
  };

  const calculateBackAngle = (keypoints) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');

    if (!shoulder || !hip) return null;

    const normalizedShoulder = normalizeKeypoint(shoulder, videoRef.current.videoWidth, videoRef.current.videoHeight, canvasRef.current.width, canvasRef.current.height);
    const normalizedHip = normalizeKeypoint(hip, videoRef.current.videoWidth, videoRef.current.videoHeight, canvasRef.current.width, canvasRef.current.height);

    const dx = normalizedShoulder.x - normalizedHip.x;
    const dy = normalizedShoulder.y - normalizedHip.y;
    const radians = Math.atan2(dx, dy);
    const angleDeg = Math.abs(radians * (180 / Math.PI));

    return angleDeg;
  };

  const categorizePosture = (angle) => {
    if (angle <= 20) return 'Upright';       // Adjusted threshold
    if (angle <= 35) return 'Normal';        // Adjusted threshold
    return 'Crouched';
  };

  const drawVisualization = (ctx, keypoints, postureLabel) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');

    if (shoulder && hip) {
      const normalizedShoulder = normalizeKeypoint(shoulder, videoRef.current.videoWidth, videoRef.current.videoHeight, canvasRef.current.width, canvasRef.current.height);
      const normalizedHip = normalizeKeypoint(hip, videoRef.current.videoWidth, videoRef.current.videoHeight, canvasRef.current.width, canvasRef.current.height);

      ctx.beginPath();
      ctx.moveTo(normalizedShoulder.x, normalizedShoulder.y);
      ctx.lineTo(normalizedHip.x, normalizedHip.y);

      const color = {
        'Upright': 'green',
        'Normal': 'orange',
        'Crouched': 'red'
      }[postureLabel];

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = '18px Arial';
      ctx.fillText(`Posture: ${postureLabel}`, 10, 30);
    }

    keypoints.forEach(point => {
      if (point.score > 0.6) {
        const normalized = normalizeKeypoint(point, videoRef.current.videoWidth, videoRef.current.videoHeight, canvasRef.current.width, canvasRef.current.height);
        ctx.beginPath();
        ctx.arc(normalized.x, normalized.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'aqua';
        ctx.fill();
      }
    });
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