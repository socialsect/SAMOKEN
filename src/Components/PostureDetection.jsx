import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';  // Add this import
import '@tensorflow/tfjs-backend-webgl';     // Ensure this import exists
const PostureDetector = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [posture, setPosture] = useState("Detecting...");
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');      // ✅ Explicitly set backend
      await tf.ready();                  // ✅ Wait for backend initialization
  
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );
      setDetector(detector);
    };
  
    loadModel();
  }, []);

  useEffect(() => {
    if (detector) {
      const interval = setInterval(() => {
        detectPose();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [detector]);

  const detectPose = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      detector
    ) {
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      if (pose && pose[0]) {
        drawOverlay(pose[0]);
        classifyPosture(pose[0]);
      }
    }
  };

  const classifyPosture = (pose) => {
    const leftShoulder = pose.keypoints.find(k => k.name === "left_shoulder");
    const leftHip = pose.keypoints.find(k => k.name === "left_hip");

    if (!leftShoulder || !leftHip || leftShoulder.score < 0.5 || leftHip.score < 0.5) {
      return setPosture("Not visible");
    }

    const dy = leftShoulder.y - leftHip.y;
    const dx = leftShoulder.x - leftHip.x;
    const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI)); // convert to degrees

    if (angle > 70) setPosture("Crouched");
    else if (angle > 40) setPosture("Normal");
    else setPosture("Upright");
  };

  const drawOverlay = (pose) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = webcamRef.current.video;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vertical reference line (center)
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Draw keypoints
    pose.keypoints.forEach(k => {
      if (k.score > 0.5) {
        ctx.beginPath();
        ctx.arc(k.x, k.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          width: "640px",
          height: "480px",
        }}
        mirrored
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "640px",
          height: "480px",
        }}
      />
      <div style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        background: "#000",
        color: "#0f0",
        padding: "8px 12px",
        borderRadius: "8px",
        fontWeight: "bold"
      }}>
        Posture: {posture}
      </div>
    </div>
  );
};

export default PostureDetector;
