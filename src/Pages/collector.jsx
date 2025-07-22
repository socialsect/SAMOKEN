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
  const [calibrationAngle, setCalibrationAngle] = useState(null);

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
          console.log('Raw Angle:', angle.toFixed(2));

          smoothingBuffer.current.push(angle);
          if (smoothingBuffer.current.length > SMOOTHING_BUFFER_SIZE) {
            smoothingBuffer.current.shift();
          }

          const smoothedAngle = smoothingBuffer.current.reduce((a, b) => a + b, 0) / smoothingBuffer.current.length;
          const adjustedAngle = calibrationAngle !== null ? Math.abs(smoothedAngle - calibrationAngle) : smoothedAngle;

          console.log('Adjusted Angle:', adjustedAngle.toFixed(2));

          const postureCategory = categorizePosture(adjustedAngle);
          setPosture(postureCategory);

          drawVisualization(ctx, keypoints, postureCategory);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  /** Normalize Keypoints */
  const normalizeKeypoint = (point, videoWidth, videoHeight, canvasWidth, canvasHeight) => ({
    x: (point.x / videoWidth) * canvasWidth,
    y: (point.y / videoHeight) * canvasHeight
  });

  const getKeypoint = (keypoints, primary, fallback) => {
    const primaryPoint = keypoints.find(kp => kp.name === primary && kp.score > 0.6);
    if (primaryPoint) return primaryPoint;
    return keypoints.find(kp => kp.name === fallback && kp.score > 0.6);
  };

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
    const radians = Math.atan2(dx, dy);
    const angleDeg = Math.abs(radians * (180 / Math.PI));

    console.log('Normalized Shoulder:', normalizedShoulder, 'Hip:', normalizedHip);
    return angleDeg;
  };

  /** Adjusted Thresholds based on golf posture patterns */
  const categorizePosture = (angle) => {
    if (angle <= 25) return 'Upright';
    if (angle <= 55) return 'Normal';
    return 'Crouched';
  };

  const drawVisualization = (ctx, keypoints, postureLabel) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');

    if (shoulder && hip) {
      const vw = videoRef.current.videoWidth || 640;
      const vh = videoRef.current.videoHeight || 480;
      const cw = canvasRef.current.width;
      const ch = canvasRef.current.height;

      const normalizedShoulder = normalizeKeypoint(shoulder, vw, vh, cw, ch);
      const normalizedHip = normalizeKeypoint(hip, vw, vh, cw, ch);

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
  };

  /** Calibrate Current Angle as Upright */
  const handleCalibrate = () => {
    if (smoothingBuffer.current.length > 0) {
      const latestAngle = smoothingBuffer.current[smoothingBuffer.current.length - 1];
      setCalibrationAngle(latestAngle);
      alert(`Calibrated at ${latestAngle.toFixed(2)}° as Upright`);
    }
  };

  return (
    <div>
      <h2>Current Posture: {posture}</h2>
      <button onClick={handleCalibrate}>Calibrate Upright</button>
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default PostureAnalyzer;