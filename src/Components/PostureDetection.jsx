import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

const PostureDetector = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [posture, setPosture] = useState("Detecting...");
  const [angle, setAngle] = useState(null);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      await tf.ready();

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
    const shoulder = pose.keypoints.find(k => k.name === "left_shoulder");
    const hip = pose.keypoints.find(k => k.name === "left_hip");

    if (!shoulder || !hip || shoulder.score < 0.5 || hip.score < 0.5) {
      return setPosture("Not visible");
    }

    const dy = shoulder.y - hip.y;
    const dx = shoulder.x - hip.x;
    let rawAngle = Math.atan2(dy, dx) * (180 / Math.PI); // Angle w.r.t horizontal
    let verticalAngle = 90 - Math.abs(rawAngle);         // Vertical reference

    setAngle(verticalAngle.toFixed(1));

    if (verticalAngle < 10) setPosture("Upright");
    else if (verticalAngle <= 30) setPosture("Normal");
    else setPosture("Crouched");
  };

  const drawOverlay = (pose) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = webcamRef.current.video;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw vertical reference line
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Draw shoulder to hip line
    const shoulder = pose.keypoints.find(k => k.name === "left_shoulder");
    const hip = pose.keypoints.find(k => k.name === "left_hip");
    if (shoulder && hip && shoulder.score > 0.5 && hip.score > 0.5) {
      ctx.beginPath();
      ctx.moveTo(shoulder.x, shoulder.y);
      ctx.lineTo(hip.x, hip.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw circle on shoulder
      ctx.beginPath();
      ctx.arc(shoulder.x, shoulder.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();

      // Draw angle text
      ctx.fillStyle = "red";
      ctx.font = "24px GoodTimes, sans-serif";
      ctx.fillText(`${angle}°`, shoulder.x + 10, shoulder.y);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "640px", margin: "0 auto" }}>
      <Webcam
        ref={webcamRef}
        style={{ position: "absolute", width: "100%", height: "auto" }}
        mirrored
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", width: "100%", height: "auto" }}
      />
      <div style={{
        position: "absolute",
        top: 10,
        left: 10,
        padding: "10px 14px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#FF0000",
        fontFamily: "GoodTimes, sans-serif",
        fontSize: "20px",
        borderRadius: "8px",
        zIndex: 10
      }}>
        {posture.toUpperCase()}
      </div>
    </div>
  );
};

export default PostureDetector;