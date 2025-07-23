import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const EMA_ALPHA = 0.2;

export default function FullscreenPostureAnalyzer() {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const detectorRef   = useRef(null);
  const smoothedAngle = useRef(null);

  const [posture,    setPosture]    = useState('Detecting…');
  const [facingMode, setFacingMode] = useState('user');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Initialize MoveNet once
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

  // Restart on camera flip
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
          width: 640,
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
      ?.forEach(t => t.stop());
  }

  function resizeCanvas() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
  }

  function detectLoop() {
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const flip = facingMode === 'user';
    
    async function frame() {
      if (!detectorRef.current || !v) return;
      const vw = v.videoWidth, vh = v.videoHeight;
      const cw = c.width, ch = c.height;
      const scale   = Math.max(cw/vw, ch/vh);
      const offsetX = (cw - vw*scale)/2;
      const offsetY = (ch - vh*scale)/2;

      ctx.clearRect(0,0,cw,ch);

      if (flip) {
        // flip both video AND overlay
        ctx.save();
        ctx.scale(-1,1);
        ctx.translate(-cw,0);
      }

      // 1) draw video
      ctx.drawImage(
        v,
        0,0, vw, vh,
        offsetX, offsetY,
        vw*scale, vh*scale
      );

      // 2) pose estimate
      const poses = await detectorRef.current.estimatePoses(v);
      if (poses[0]) {
        const raw = calculateBackAngleMid(poses[0].keypoints);
        if (raw != null) {
          // EMA smoothing
          const prev = smoothedAngle.current ?? raw;
          const next = prev*(1-EMA_ALPHA) + raw*EMA_ALPHA;
          smoothedAngle.current = next;

          const cat = categorize(next);
          setPosture(`${cat} | ${next.toFixed(1)}°`);

          // map & draw spine+arc inside the same flip
          const mapped = poses[0].keypoints.map(p => ({
            x: p.x*scale + offsetX,
            y: p.y*scale + offsetY,
            name: p.name,
            score: p.score
          }));
          drawSpinePlusArc(ctx, mapped, next);
        }
      }

      if (flip) ctx.restore();

      requestAnimationFrame(frame);
    }
    frame();
  }

  // — helpers —

  function getKey(kps, a, b) {
    return kps.find(x=>x.name===a&&x.score>0.6)
        || kps.find(x=>x.name===b&&x.score>0.6)
        || null;
  }

  function calculateBackAngleMid(kps) {
    const sh = ['left_shoulder','right_shoulder']
      .map(n=>getKey(kps,n,n)).filter(Boolean);
    const hi = ['left_hip','right_hip']
      .map(n=>getKey(kps,n,n)).filter(Boolean);
    if (!sh.length || !hi.length) return null;
    const avg = pts => ({
      x: pts.reduce((s,p)=>s+p.x,0)/pts.length,
      y: pts.reduce((s,p)=>s+p.y,0)/pts.length
    });
    const ms = avg(sh), mh = avg(hi);
    const dx = ms.x-mh.x, dy = ms.y-mh.y, mag = Math.hypot(dx,dy);
    if (!mag) return null;
    return Math.acos(-dy/mag)*(180/Math.PI);
  }

  function categorize(a) {
    return a<=10 ? 'Upright' : a<=25 ? 'Normal' : 'Crouched';
  }

  /** Draw single spine line + interior angle arc **/
  function drawSpinePlusArc(ctx, kps, angle) {
    const hip = getKey(kps,'left_hip','right_hip');
    const sh  = getKey(kps,'left_shoulder','right_shoulder');
    if (!hip || !sh) return;

    // spine line
    ctx.strokeStyle='red';
    ctx.lineWidth=4;
    ctx.beginPath();
      ctx.moveTo(hip.x,hip.y);
      ctx.lineTo(sh.x,sh.y);
    ctx.stroke();

    // interior arc
    const dx = sh.x - hip.x;
    const dy = sh.y - hip.y;
    const spineRad = Math.atan2(dy,dx);
    const down    = Math.PI/2;
    const r       = 40;
    let diff = (spineRad-down+2*Math.PI)%(2*Math.PI);
    const ccw = diff>Math.PI;
    ctx.beginPath();
      ctx.lineWidth=3;
      ctx.strokeStyle='red';
      ctx.arc(hip.x,hip.y,r,down,spineRad,ccw);
    ctx.stroke();

    // label
    const bis = down + (ccw ? -(2*Math.PI-diff)/2 : diff/2);
    ctx.fillStyle='red';
    ctx.font='14px Arial';
    ctx.fillText(
      `${angle.toFixed(0)}°`,
      hip.x + (r+6)*Math.cos(bis),
      hip.y + (r+6)*Math.sin(bis)
    );
  }

  return (
    <div style={{
      position:'fixed',top:0,left:0,
      width:'100vw',height:'100vh',
      background:'#000',overflow:'hidden'
    }}>
      <video
        ref={videoRef}
        style={{display:'none'}}
        playsInline muted autoPlay
      />
      <canvas
        ref={canvasRef}
        style={{
          position:'absolute',
          top:0,left:'50%',
          transform:'translateX(-50%)',
          height:'100vh',
          width:'auto'
        }}
      />

      {/* UI overlay */}
      <div style={{
        position:'absolute',top:20,left:20,right:20,
        display:'flex',justifyContent:'space-between',
        alignItems:'center',pointerEvents:'none',zIndex:2
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