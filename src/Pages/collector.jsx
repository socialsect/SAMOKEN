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
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
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
          const postureCategory = categorizePosture(smoothedAngle);
          setPosture(postureCategory);

          drawVisualization(ctx, keypoints, postureCategory);
        }
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  /** SIDE VIEW ANGLE CALCULATION **/
  const calculateBackAngle = (keypoints) => {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder' && kp.score > 0.6);
    const leftHip = keypoints.find(kp => kp.name === 'left_hip' && kp.score > 0.6);

    if (!leftShoulder || !leftHip) return null;

    const dx = leftShoulder.x - leftHip.x;
    const dy = leftShoulder.y - leftHip.y;
    const radians = Math.atan2(dx, dy);
    const angleDeg = Math.abs(radians * (180 / Math.PI));

    return angleDeg;
  };

  const categorizePosture = (angle) => {
    if (angle <= 15) return 'Upright';
    if (angle <= 30) return 'Normal';
    return 'Crouched';
  };

  const drawVisualization = (ctx, keypoints, postureLabel) => {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');

    if (leftShoulder && leftHip) {
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x, leftShoulder.y);
      ctx.lineTo(leftHip.x, leftHip.y);

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
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
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