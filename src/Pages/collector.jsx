// PostureDataCollector.jsx
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

const PostureDataCollector = () => {
  const webcamRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [currentLabel, setCurrentLabel] = useState("Upright");
  const [isCollecting, setIsCollecting] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      const d = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        { runtime: 'tfjs', modelType: 'full', enableSmoothing: true }
      );
      setDetector(d);
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (detector && isCollecting) {
      const interval = setInterval(() => {
        detectPose();
      }, 200);
      return () => clearInterval(interval);
    }
  }, [detector, isCollecting]);

  const extractFeatures = (keypoints) => {
    const kp = keypoints.reduce((acc, key) => {
      if (key.score > 0.5) acc[key.name] = key;
      return acc;
    }, {});

    const getAngle = (a, b, c) => {
      if (!a || !b || !c) return 0;
      const ab = { x: b.x - a.x, y: b.y - a.y };
      const cb = { x: b.x - c.x, y: b.y - c.y };
      const dot = ab.x * cb.x + ab.y * cb.y;
      const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
      const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
      const cosine = dot / (magAB * magCB);
      return Math.acos(cosine) * (180 / Math.PI);
    };

    const features = {
      shoulder_hip_knee_angle:
        getAngle(kp.left_shoulder, kp.left_hip, kp.left_knee) ||
        getAngle(kp.right_shoulder, kp.right_hip, kp.right_knee),
      spine_slope: kp.left_shoulder && kp.left_hip ? (kp.left_hip.y - kp.left_shoulder.y) / (kp.left_hip.x - kp.left_shoulder.x + 0.01) : 0,
      neck_to_hip_dist: kp.left_shoulder && kp.left_hip ? Math.abs(kp.left_shoulder.y - kp.left_hip.y) : 0,
      label: currentLabel
    };

    return features;
  };

  const detectPose = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      detector
    ) {
      const poses = await detector.estimatePoses(webcamRef.current.video);
      if (poses && poses[0]) {
        const features = extractFeatures(poses[0].keypoints);
        setData(prev => [...prev, features]);
      }
    }
  };

  const downloadData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'posture_dataset.json';
    a.click();
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>🧠 Posture Training Data Collector</h2>
      <Webcam
        ref={webcamRef}
        style={{ width: 640, height: 480, marginBottom: 10 }}
        mirrored={false}
      />
      <div style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 10 }}>Label:</label>
        <select
          value={currentLabel}
          onChange={(e) => setCurrentLabel(e.target.value)}
          style={{ padding: '6px 10px' }}
        >
          <option value="Upright">Upright</option>
          <option value="Normal">Normal</option>
          <option value="Crouched">Crouched</option>
        </select>
      </div>
      <button
        onClick={() => setIsCollecting(!isCollecting)}
        style={{ marginRight: 10, padding: '6px 14px' }}
      >
        {isCollecting ? '🛑 Stop' : '▶️ Start Collecting'}
      </button>
      <button
        onClick={downloadData}
        style={{ padding: '6px 14px' }}
        disabled={data.length === 0}
      >
        💾 Export JSON ({data.length} samples)
      </button>
    </div>
  );
};

export default PostureDataCollector;
