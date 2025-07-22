import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const SMOOTHING_BUFFER_SIZE = 5;

export default function FullscreenPostureAnalyzer() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const detectorRef = useRef(null);

  const [posture,    setPosture]    = useState('Detecting…');
  const [facingMode, setFacingMode] = useState('user');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    (async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        detectorRef.current = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          { modelType: posedetection.movenet.modelType.LIGHTNING }
        );
        startCamera();
      } catch (e) {
        console.error(e);
        setError('Failed to init pose detector');
      }
    })();
    return stopCamera;
  }, []);

  useEffect(() => {
    if (detectorRef.current) startCamera();
  }, [facingMode]);

  async function startCamera() {
    setLoading(true);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width:  640,
          height: 480
        },
        audio: false
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        resizeCanvas();
        setLoading(false);
        detectLoop();
      };
    } catch (e) {
      console.error(e);
      setError('Camera access denied');
      setLoading(false);
    }
  }

  function stopCamera() {
    videoRef.current?.srcObject
      ?.getTracks()
      .forEach(t => t.stop());
  }

  function resizeCanvas() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
  }

  function detectLoop() {
    const v = videoRef.current, c = canvasRef.current, ctx = c.getContext('2d');
    const buf = [];

    async function frame() {
      if (!v || v.readyState < 2) return requestAnimationFrame(frame);

      const vw = v.videoWidth, vh = v.videoHeight;
      const cw = c.width, ch = c.height;
      
      // Calculate scaling to fit video within canvas while maintaining aspect ratio
      const scale = Math.min(cw / vw, ch / vh);
      const scaledWidth = vw * scale;
      const scaledHeight = vh * scale;
      const offsetX = (cw - scaledWidth) / 2;
      const offsetY = (ch - scaledHeight) / 2;

      // Clear canvas
      ctx.clearRect(0, 0, cw, ch);
      
      // Save context state for mirroring if using front camera
      if (facingMode === 'user') {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-cw, 0);
      }

      // Draw video centered and scaled to fit
      ctx.drawImage(
        v,
        0, 0, vw, vh,  // source dimensions
        facingMode === 'user' ? cw - offsetX - scaledWidth : offsetX, // x position (account for mirroring)
        offsetY,        // y position
        scaledWidth,    // width
        scaledHeight    // height
      );

      // pose estimation
      const poses = await detectorRef.current.estimatePoses(v);
      if (poses[0]) {
        const angle = calculateBackAngle(poses[0].keypoints);
        if (angle != null) {
          buf.push(angle);
          if (buf.length > SMOOTHING_BUFFER_SIZE) buf.shift();
          const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
          const cat = categorizePosture(avg);
          setPosture(`${cat} | ${avg.toFixed(1)}°`);

          const mapped = poses[0].keypoints.map(p => ({
            x: (facingMode === 'user' 
              ? cw - (p.x * scale) - offsetX // Account for mirroring
              : (p.x * scale) + offsetX),
            y: (p.y * scale) + offsetY,
            name: p.name,
            score: p.score
          }));
          drawOverlay(ctx, mapped, cat);
        }
      }

      if (facingMode === 'user') ctx.restore();
      requestAnimationFrame(frame);
    }

    frame();
  }

  function getKeypoint(kps, primary, fallback) {
    return (
      kps.find(p => p.name === primary && p.score > 0.6) ||
      kps.find(p => p.name === fallback && p.score > 0.6) ||
      null
    );
  }

  function calculateBackAngle(kps) {
    const s = getKeypoint(kps,'left_shoulder','right_shoulder');
    const h = getKeypoint(kps,'left_hip','right_hip');
    if (!s || !h) return null;
    const dx = s.x - h.x, dy = s.y - h.y;
    const m = Math.hypot(dx,dy);
    if (m === 0) return null;
    const dot = -dy; // vs. (0,-1)
    return Math.acos(dot/m)*(180/Math.PI);
  }

  function categorizePosture(angle) {
    return angle <= 10   ? 'Upright'
         : angle <= 25   ? 'Normal'
                         : 'Crouched';
  }

  function drawOverlay(ctx, kps, label) {
    const s = getKeypoint(kps,'left_shoulder','right_shoulder');
    const h = getKeypoint(kps,'left_hip','right_hip');
    if (!s || !h) return;
    ctx.strokeStyle = label==='Upright' ? 'lime'
                     : label==='Normal'  ? 'orange'
                                         : 'red';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(h.x, h.y);
    ctx.stroke();
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: '#000', overflow: 'hidden'
    }}>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline muted autoPlay
      />

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />

      {/* UI overlay */}
      <div style={{
        position: 'absolute',
        top: 20, left: 20, right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 2
      }}>
        <select
          value={facingMode}
          onChange={e => setFacingMode(e.target.value)}
          style={{
            pointerEvents: 'auto',
            padding: '6px 10px',
            fontSize: '1rem',
            borderRadius: '4px'
          }}
        >
          <option value="user">🤳 Front</option>
          <option value="environment">📷 Back</option>
        </select>

        <div style={{
          pointerEvents: 'none',
          color: '#fff',
          fontSize: '1.2rem',
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {loading ? 'Loading…' : posture}
        </div>
      </div>

      {error && (
        <div style={{
          position: 'absolute',
          bottom: 20, left: 20, right: 20,
          color: 'red',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.6)',
          padding: '6px 12px',
          borderRadius: '4px',
          zIndex: 2
        }}>
          {error}
        </div>
      )}
    </div>
  );
}