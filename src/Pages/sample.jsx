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
      await tf.setBackend('webgl');
      await tf.ready();
      detectorRef.current = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.LIGHTNING }
      );
      startCamera();
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
        video: { facingMode:{ideal: facingMode}, width:640, height:480 },
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
    videoRef.current?.srcObject?.getTracks().forEach(t=>t.stop());
  }

  function resizeCanvas() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v||!c) return;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
  }

  function detectLoop() {
    const v = videoRef.current, c = canvasRef.current, ctx = c.getContext('2d');
    const buf = [];
    const flip = facingMode === 'user';

    async function frame() {
      if (!detectorRef.current || !v) return;

      // — cover‐style math —
      const vw = v.videoWidth, vh = v.videoHeight;
      const cw = c.width,       ch = c.height;
      const scale   = Math.max(cw/vw, ch/vh);
      const offsetX = (cw - vw*scale)/2;
      const offsetY = (ch - vh*scale)/2;

      // 1) clear
      ctx.clearRect(0,0,cw,ch);

      // 2) draw video, flipped only if front camera
      if (flip) {
        ctx.save();
        ctx.scale(-1,1);
        ctx.translate(-cw,0);
      }
      ctx.drawImage(v,
        0,0,vw,vh,
        offsetX,offsetY,vw*scale,vh*scale
      );
      if (flip) ctx.restore();

      // 3) pose estimate (on raw video coords)
      const poses = await detectorRef.current.estimatePoses(v);
      if (poses[0]) {
        const rawAngle = calculateBackAngle(poses[0].keypoints);
        if (rawAngle!=null) {
          buf.push(rawAngle);
          if (buf.length>SMOOTHING_BUFFER_SIZE) buf.shift();
          const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
          setPosture(`${categorizePosture(avg)} | ${avg.toFixed(1)}°`);

          // 4) map keypoints into canvas coords
          const kps = poses[0].keypoints.map(p=>({
            x: p.x*scale + offsetX,
            y: p.y*scale + offsetY,
            name: p.name, score: p.score
          }));

          // 5) draw your red lines & arc _in normal context_
          drawGuides(ctx, kps, rawAngle);
        }
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  function getKeypoint(kps, prim, fall) {
    return kps.find(p=>p.name===prim&&p.score>0.6)
        || kps.find(p=>p.name===fall&&p.score>0.6)
        || null;
  }

  function calculateBackAngle(kps) {
    const s = getKeypoint(kps,'left_shoulder','right_shoulder');
    const h = getKeypoint(kps,'left_hip','right_hip');
    if (!s||!h) return null;
    const dx = s.x-h.x, dy = s.y-h.y, m = Math.hypot(dx,dy);
    if (!m) return null;
    return Math.acos(-dy/m)*(180/Math.PI);
  }

  function categorizePosture(a) {
    return a<=10 ? 'Upright' : a<=25 ? 'Normal' : 'Crouched';
  }

  function drawGuides(ctx, kps, rawAngle) {
    const hip      = getKeypoint(kps,'left_hip','right_hip');
    const shoulder = getKeypoint(kps,'left_shoulder','right_shoulder');
    const ankle    = getKeypoint(kps,'left_ankle','right_ankle');
    if (!hip||!shoulder||!ankle) return;

    // ✱ vertical leg line
    ctx.strokeStyle='red'; ctx.lineWidth=2;
    ctx.beginPath();
      ctx.moveTo(ankle.x,0);
      ctx.lineTo(ankle.x,ctx.canvas.height);
    ctx.stroke();

    // ✱ spine line
    ctx.strokeStyle='red'; ctx.lineWidth=4;
    ctx.beginPath();
      ctx.moveTo(hip.x,hip.y);
      ctx.lineTo(shoulder.x,shoulder.y);
    ctx.stroke();

    // ✱ angle arc
    const spineRad = Math.atan2(shoulder.y-hip.y, shoulder.x-hip.x);
    const vertDown = Math.PI/2;
    const r = 40;
    ctx.strokeStyle='red'; ctx.lineWidth=3;
    ctx.beginPath();
      ctx.arc(hip.x, hip.y, r, vertDown, spineRad, spineRad<vertDown);
    ctx.stroke();

    // ✱ angle label
    ctx.fillStyle='red'; ctx.font='14px Arial';
    ctx.fillText(`${rawAngle.toFixed(0)}°`, hip.x+r+4, hip.y-4);
  }

  return (
    <div style={{
      position:'fixed', top:0,left:0,
      width:'100vw',height:'100vh',
      background:'#000',overflow:'hidden'
    }}>
      <video ref={videoRef} style={{display:'none'}} playsInline muted autoPlay/>
      <canvas
        ref={canvasRef}
        style={{
          position:'absolute',
          top:0,left:'50%',
          transform:'translateX(-50%)',
          height:'100vh', width:'auto'
        }}
      />

      {/* UI Overlay */}
      <div style={{
        position:'absolute',
        top:20,left:20,right:20,
        display:'flex',justifyContent:'space-between',
        alignItems:'center',
        pointerEvents:'none', zIndex:2
      }}>
        <select
          value={facingMode}
          onChange={e=>setFacingMode(e.target.value)}
          style={{
            pointerEvents:'auto',
            padding:'6px 10px',
            fontSize:'1rem',
            borderRadius:'4px'
          }}
        >
          <option value="user">🤳 Front</option>
          <option value="environment">📷 Back</option>
        </select>
        <div style={{
          pointerEvents:'none',
          color:'#fff',
          fontSize:'1.2rem',
          background:'rgba(0,0,0,0.5)',
          padding:'4px 8px',
          borderRadius:'4px'
        }}>
          {loading? 'Loading…': posture}
        </div>
      </div>

      {error && (
        <div style={{
          position:'absolute',
          bottom:20,left:20,right:20,
          color:'red',textAlign:'center',
          background:'rgba(0,0,0,0.6)',
          padding:'6px 12px',borderRadius:'4px',zIndex:2
        }}>
          {error}
        </div>
      )}
    </div>
  );
}