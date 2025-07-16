// 🏌️‍♂️ PostureDetector (BlazePose + fallback + visual overlay + vertical ref line)
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

const LANG = {
  en: {
    detecting: "Detecting...",
    posture: "Posture",
    saved: "Saved Result"
  },
  fr: {
    detecting: "Détection...",
    posture: "Posture",
    saved: "Résultat Sauvegardé"
  }
};

const PostureDetector = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [posture, setPosture] = useState("Detecting...");
  const [angle, setAngle] = useState(null);
  const [language, setLanguage] = useState("en");
  const [detector, setDetector] = useState(null);
  const [finalResult, setFinalResult] = useState(() => {
    const stored = localStorage.getItem('postureResult');
    return stored ? JSON.parse(stored) : null;
  });
  const postureBuffer = useRef([]);

  const t = (key) => LANG[language][key];

  const calculateAngle = (a, b, c) => {
    if (!a || !b || !c) return NaN;
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const cb = { x: b.x - c.x, y: b.y - c.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
    const cosineAngle = dot / (magAB * magCB);
    return Math.acos(cosineAngle) * (180 / Math.PI);
  };

  const debounceClass = (label, angleVal) => {
    if (isNaN(angleVal)) return;
    postureBuffer.current.push({ label, angleVal });
    if (postureBuffer.current.length > 10) postureBuffer.current.shift();
    const freq = postureBuffer.current.reduce((acc, curr) => {
      acc[curr.label] = (acc[curr.label] || 0) + 1;
      return acc;
    }, {});
    const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    const avgAngle = (
      postureBuffer.current.reduce((sum, curr) => sum + curr.angleVal, 0) /
      postureBuffer.current.length
    ).toFixed(1);

    setPosture(mostCommon);
    setAngle(avgAngle);
    const final = { posture: mostCommon, angle: avgAngle };
    setFinalResult(final);
    localStorage.setItem('postureResult', JSON.stringify(final));
  };

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime: 'tfjs',
          enableSmoothing: true,
          modelType: 'full'
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
      }, 300);
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
      const poses = await detector.estimatePoses(video, { flipHorizontal: false });
      if (poses && poses[0]) {
        drawOverlay(poses[0]);
        classifyPosture(poses[0]);
      }
    }
  };

  const classifyPosture = (pose) => {
    const keypoints = pose.keypoints.reduce((acc, key) => {
      if (key.score > 0.5) acc[key.name] = key;
      return acc;
    }, {});

    let shoulder = keypoints.left_shoulder || keypoints.right_shoulder;
    let hip = keypoints.left_hip || keypoints.right_hip;
    let knee = keypoints.left_knee || keypoints.right_knee;

    const angle = calculateAngle(shoulder, hip, knee);
    if (isNaN(angle)) return;

    let label = 'Upright';
    if (angle < 140) label = 'Normal';
    if (angle < 110) label = 'Crouched';
    debounceClass(label, angle);
  };

  const drawOverlay = (pose) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = webcamRef.current.video;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vertical reference line
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    pose.keypoints.forEach(k => {
      if (k.score > 0.5) {
        ctx.beginPath();
        ctx.arc(k.x, k.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });

    const k = pose.keypoints.reduce((acc, key) => {
      if (key.score > 0.5) acc[key.name] = key;
      return acc;
    }, {});

    const shoulder = k.left_shoulder || k.right_shoulder;
    const hip = k.left_hip || k.right_hip;
    const knee = k.left_knee || k.right_knee;

    if (shoulder && hip && knee) {
      ctx.beginPath();
      ctx.moveTo(shoulder.x, shoulder.y);
      ctx.lineTo(hip.x, hip.y);
      ctx.lineTo(knee.x, knee.y);
      ctx.strokeStyle = "#00f";
      ctx.lineWidth = 3;
      ctx.stroke();

      const a = calculateAngle(shoulder, hip, knee);
      if (!isNaN(a)) {
        ctx.fillStyle = "#fff";
        ctx.font = "16px GoodTimes, sans-serif";
        ctx.fillText(`${a.toFixed(1)}°`, hip.x + 10, hip.y);
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
        }}
        mirrored={false}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
        }}
      />
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "#000",
        color: "#f00",
        padding: "10px 14px",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "1.2rem",
        fontFamily: "GoodTimes, sans-serif"
      }}>
        {t("posture")}: {posture} ({angle}°)
      </div>
      {finalResult && (
        <div style={{
          position: "absolute",
          bottom: 70,
          left: 20,
          background: "#000",
          color: "#0f0",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "1rem",
          fontFamily: "GoodTimes, sans-serif"
        }}>
          {t("saved")}: {finalResult.posture} ({finalResult.angle}°)
        </div>
      )}
      <button
        onClick={() => setLanguage(language === "en" ? "fr" : "en")}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#f00",
          color: "#fff",
          padding: "6px 10px",
          border: "none",
          borderRadius: "6px",
          fontFamily: "GoodTimes, sans-serif",
          cursor: "pointer"
        }}>
        {language === "en" ? "FR" : "EN"}
      </button>
    </div>
  );
};

export default PostureDetector;
