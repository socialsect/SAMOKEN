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
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    const init = async () => {
      await tf.setBackend('webgl');
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.LIGHTNING,
      };
      detectorRef.current = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        detectorConfig
      );

      await listCameras();
    };
    init();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const listCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    setDevices(videoDevices);
    const preferred = videoDevices.find(d => d.label.toLowerCase().includes('back')) || videoDevices[0];
    setSelectedDeviceId(preferred?.deviceId || null);
  };

  useEffect(() => {
    if (selectedDeviceId) {
      setupCamera(selectedDeviceId).then(() => {
        detectPose();
      });
    }
  }, [selectedDeviceId]);

  const setupCamera = async (deviceId) => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    const video = videoRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      video.srcObject = stream;
      return new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
    } catch (err) {
      console.error('Camera setup error:', err);
      alert('Unable to access camera. Please allow permissions or try a different device.');
    }
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
          const postureCategory = categorizePosture(smoothedAngle);
          setPosture(postureCategory);
          drawVisualization(ctx, keypoints, postureCategory, smoothedAngle);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

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

    const backMagnitude = Math.sqrt(dx * dx + dy * dy);
    if (backMagnitude === 0) return null;

    const dotProduct = dy * -1;
    const angleRad = Math.acos(dotProduct / backMagnitude);
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

    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;

    const normalizedShoulder = normalizeKeypoint(shoulder, vw, vh, cw, ch);
    const normalizedHip = normalizeKeypoint(hip, vw, vh, cw, ch);

    ctx.beginPath();
    ctx.moveTo(normalizedShoulder.x, normalizedShoulder.y);
    ctx.lineTo(normalizedHip.x, normalizedHip.y);
    ctx.strokeStyle = 'aqua';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Posture: ${postureLabel} | Angle: ${angle.toFixed(1)}°`, 10, 30);

    drawArrow(ctx, normalizedHip, normalizedShoulder, "red");
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
    ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(to.x, to.y);
    ctx.fill();
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Current Posture: {posture}</h2>

      <label>Select Camera:</label>
      <select
        onChange={(e) => setSelectedDeviceId(e.target.value)}
        value={selectedDeviceId || ''}
        style={{ margin: '10px', padding: '5px' }}
      >
        {devices.map((device, i) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${i + 1}`}
          </option>
        ))}
      </select>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video
          ref={videoRef}
          width="640"
          height="480"
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, opacity: 0 }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ zIndex: 2 }}
        />
      </div>
    </div>
  );
};

export default PostureAnalyzer;
