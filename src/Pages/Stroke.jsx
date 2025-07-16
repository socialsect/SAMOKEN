import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Webcam from 'react-webcam';
import { useStroke } from '../contexts/StrokeContext';
import '../Styles/StrokeArcAnalyzer.css';

const LANG = {
  en: {
    instructions: ['Get Ready...', 'Stroke 1 of 3', 'Stroke 2 of 3', 'Stroke 3 of 3', 'Analyzing...', 'Result:'],
    arcTypes: ['Straight', 'Slight Arc', 'Strong Arc']
  },
  fr: {
    instructions: ['Préparez-vous...', 'Coup 1 sur 3', 'Coup 2 sur 3', 'Coup 3 sur 3', 'Analyse en cours...', 'Résultat :'],
    arcTypes: ['Droit', 'Arc Léger', 'Arc Prononcé']
  }
};

const StrokeArcAnalyzer = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [strokePaths, setStrokePaths] = useState([]);
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const { saveArcResult } = useStroke();

  const t = LANG[language];

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      await tf.ready();
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const det = await poseDetection.createDetector(model, detectorConfig);
      setDetector(det);
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (detector && strokeIndex < 3) {
      collectStroke();
    }
  }, [countdown]);

  const collectStroke = async () => {
    const ctx = canvasRef.current.getContext('2d');
    const path = [];
    let frames = 0;

    const draw = async () => {
      if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) return;
      const video = webcamRef.current.video;
      const poses = await detector.estimatePoses(video);
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (poses[0]?.keypoints) {
        const wrist = poses[0].keypoints.find(k => k.name === 'right_wrist');
        if (wrist?.score > 0.3) {
          const x = wrist.x;
          const y = wrist.y;
          path.push({ x, y });

          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      frames++;
      if (frames < 60) {
        requestAnimationFrame(draw);
      } else {
        setStrokePaths(prev => [...prev, path]);
        setStrokeIndex(prev => prev + 1);
        setCountdown(3);
      }
    };
    draw();
  };

  useEffect(() => {
    if (strokeIndex === 3) {
      classifyAndFinish();
    }
  }, [strokeIndex]);

  const classifyAndFinish = () => {
    const arcLabels = [];

    strokePaths.forEach(path => {
      const dx = path[path.length - 1].x - path[0].x;
      const dy = path[path.length - 1].y - path[0].y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      if (Math.abs(angle) < 15) arcLabels.push(0);
      else if (Math.abs(angle) < 45) arcLabels.push(1);
      else arcLabels.push(2);
    });

    const avg = Math.round(arcLabels.reduce((a, b) => a + b, 0) / arcLabels.length);
    const finalLabel = t.arcTypes[avg];
    setResult(finalLabel);
    saveArcResult(finalLabel); // Update context and localStorage
  };

  return (
    <div className="stroke-container">
      <div className="language-toggle">
        <button onClick={() => setLanguage(prev => (prev === 'en' ? 'fr' : 'en'))}>
          {language === 'en' ? 'Français' : 'English'}
        </button>
      </div>

      <Webcam
        ref={webcamRef}
        mirrored
        className="stroke-webcam"
        videoConstraints={{ facingMode: 'environment' }}
      />
      <canvas ref={canvasRef} className="stroke-canvas" />

      <div className="overlay-text">
        {strokeIndex < 3 && countdown > 0 && <h1>{countdown}</h1>}
        {strokeIndex < 3 && countdown === 0 && <h2>{t.instructions[strokeIndex + 1]}</h2>}
        {strokeIndex === 3 && <h2>{t.instructions[4]}</h2>}
        {result && <h2>{t.instructions[5]} <span className="stroke-result">{result}</span></h2>}
      </div>
    </div>
  );
};

export default StrokeArcAnalyzer; 