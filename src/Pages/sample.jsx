import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const SMOOTHING_BUFFER_SIZE = 5;

const SAMPLE = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);

  const [posture, setPosture] = useState('Detecting…');
  const [facingMode, setFacingMode] = useState('user');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // 1️⃣ Initialize MoveNet once
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
        setError('Failed to initialize pose detector');
      }
    })();

    return stopCamera;
  }, []);

  // 2️⃣ Restart camera on facingMode change
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
          width:  { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        resizeCanvas();
        setLoading(false);
        detectPoseLoop();
      };
    } catch (e) {
      console.error(e);
      setError('Camera access denied');
      setLoading(false);
    }
  }

  function stopCamera() {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
  }

  function resizeCanvas() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
  }

  function detectPoseLoop() {
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const buf = [];

    async function frame() {
      if (!detectorRef.current || !v) return;

      // draw camera feed
      ctx.drawImage(v, 0, 0, c.width, c.height);

      // pose estimation
      const poses = await detectorRef.current.estimatePoses(v);
      if (poses[0]) {
        const angle = calculateBackAngle(poses[0].keypoints);
        if (angle !== null) {
          buf.push(angle);
          if (buf.length > SMOOTHING_BUFFER_SIZE) buf.shift();
          const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
          const cat = categorizePosture(avg);
          setPosture(`${cat} | ${avg.toFixed(1)}°`);
          drawOverlay(ctx, poses[0].keypoints, cat, avg);
        }
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  // — exact same helper functions you had —

  function getKeypoint(kps, primary, fallback) {
    return kps.find(p=>p.name===primary&&p.score>0.6)
        || kps.find(p=>p.name===fallback&&p.score>0.6)
        || null;
  }

  function calculateBackAngle(kps) {
    const s = getKeypoint(kps,'left_shoulder','right_shoulder');
    const h = getKeypoint(kps,'left_hip','right_hip');
    if (!s || !h) return null;

    const dx = s.x - h.x;
    const dy = s.y - h.y;
    const m = Math.hypot(dx,dy);
    if (m === 0) return null;

    const dot = -dy;      // dot with vertical (0,-1)
    const angleRad = Math.acos(dot / m);
    return angleRad * (180/Math.PI);
  }

  function categorizePosture(angle) {
    if (angle <= 10) return 'Upright';
    if (angle <= 25) return 'Normal';
    return 'Crouched';
  }

  function drawOverlay(ctx, kps, label, angle) {
    const s = getKeypoint(kps,'left_shoulder','right_shoulder');
    const h = getKeypoint(kps,'left_hip','right_hip');
    if (!s || !h) return;

    const color = label==='Upright' ? 'lime'
                  : label==='Normal'  ? 'orange'
                                     : 'red';

    ctx.lineWidth   = 4;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(h.x, h.y);
    ctx.stroke();
  }

  // — full-screen JSX with your original UI styles overlaid —

  return (
    <div style={{
      position:'fixed', top:0, left:0,
      width:'100vw', height:'100vh',
      background:'#000', overflow:'hidden'
    }}>
      {/* hidden video element */}
      <video
        ref={videoRef}
        style={{ display:'none' }}
        playsInline muted autoPlay
      />

      {/* full-screen canvas */}
      <canvas
        ref={canvasRef}
        style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scaleX(0.85)', // squash horizontally
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
          }}  />

      {/* UI overlay—matching your previous look */}
      <div style={{
        position:'absolute',
        top: 20, left:20, right:20,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        color:'#fff',
        fontFamily:'Arial, sans-serif',
        pointerEvents:'none', /* canvas clicks pass through */
        zIndex:2
      }}>
        {/* camera switch dropdown */}
        <div style={{ pointerEvents:'auto' }}>
          <select
            value={facingMode}
            onChange={e=>setFacingMode(e.target.value)}
            style={{
              padding:'6px 10px',
              fontSize:'1rem',
              borderRadius:'4px'
            }}
          >
            <option value="user">🤳 Front</option>
            <option value="environment">📷 Back</option>
          </select>
        </div>

        {/* posture text */}
        <div style={{
          fontSize:'1.2rem',
          background:'rgba(0,0,0,0.5)',
          padding:'4px 8px',
          borderRadius:'4px'
        }}>
          {loading ? 'Loading…' : posture}
        </div>
      </div>
{/* posture color legend */}
<div style={{
  position: 'absolute',
  bottom: 20,
  right: 20,
  background: 'rgba(0,0,0,0.5)',
  padding: '8px 12px',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.9rem',
  fontFamily: 'Arial, sans-serif',
  lineHeight: '1.4',
  pointerEvents: 'none',
  zIndex: 2
}}>
  <div><span style={{ color: 'lime', fontWeight: 'bold' }}>●</span> Upright</div>
  <div><span style={{ color: 'orange', fontWeight: 'bold' }}>●</span> Normal</div>
  <div><span style={{ color: 'red', fontWeight: 'bold' }}>●</span> Crouched</div>
</div>

      {/* error banner */}
      {error && (
        <div style={{
          position:'absolute',
          bottom:20, left:20, right:20,
          color:'red',
          textAlign:'center',
          fontSize:'1rem',
          background:'rgba(0,0,0,0.6)',
          padding:'6px 12px',
          borderRadius:'4px',
          zIndex:2
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
export default SAMPLE;
