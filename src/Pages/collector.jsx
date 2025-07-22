import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const PostureAnalyzer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const [posture, setPosture] = useState('Detecting...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await tf.setBackend('webgl');
      await tf.ready();

      const detectorConfig = {
        modelType: posedetection.movenet.modelType.LIGHTNING,
      };
      detectorRef.current = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);

      await setupCamera();
      setLoading(false);
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
        facingMode: 'user', // Front camera with mirrored feed
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const processFrame = async () => {
      const poses = await detectorRef.current.estimatePoses(video);
      ctx.save();

      // Flip the canvas horizontally
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

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
    const primaryPoint = keypoints.find(kp => kp.name === primary && kp.score > 0.6);
    if (primaryPoint) return primaryPoint;
    return keypoints.find(kp => kp.name === fallback && kp.score > 0.6);
  };

  const calculateBackAngle = (keypoints) => {
    const shoulder = getKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
    const hip = getKeypoint(keypoints, 'left_hip', 'right_hip');

    if (!shoulder || !hip) return null;

    const dx = shoulder.x - hip.x;
    const dy = shoulder.y - hip.y;

    const backMagnitude = Math.sqrt(dx * dx + dy * dy);
    if (backMagnitude === 0) return null;

    const dotProduct = (dx * 0) + (dy * -1);
    const angleRad = Math.acos(dotProduct / backMagnitude);
    const angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
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

    const postureColor = {
      'Upright': 'green',
      'Normal': 'orange',
      'Crouched': 'red'
    }[postureLabel] || 'white';

    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(hip.x, hip.y);
    ctx.strokeStyle = postureColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = postureColor;
    ctx.font = '16px Arial';
    ctx.fillText(`Posture: ${postureLabel} | Angle: ${angle.toFixed(1)}°`, 10, 30);
  };

  return (
    <div>
      {loading ? (
        <h2>Loading Pose Model & Camera...</h2>
      ) : (
        <>
          <h2>Current Posture: {posture}</h2>
          <video
            ref={videoRef}
            style={{ display: 'none' }}
            playsInline
          />
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: '640px' }}
          />
        </>
      )}
    </div>
  );
};

export default PostureAnalyzer;