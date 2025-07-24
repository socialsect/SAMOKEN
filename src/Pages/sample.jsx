// src/components/VideoBallAnalyzer.jsx
import React, { useRef, useState, useEffect } from 'react';

export default function VideoBallAnalyzer() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  const [running,    setRunning]    = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // default back-camera

  // holds the last N ball positions for the path
  const pathRef     = useRef([]);
  const MAX_PATH    = 100;

  // 1) CAMERA STREAM START / STOP
  useEffect(() => {
    if (!running) return;
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (err) {
        console.error('Camera error', err);
        alert('Camera error: ' + err.message);
        setRunning(false);
      }
    })();
    return () => {
      // stop tracks & clear srcObject
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [running, facingMode]);

  // 2) OPENCV LOOP + RENDERING
  useEffect(() => {
    if (!running) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    let frameMat, fgMat, contours, hierarchy, cap, backSub;
    let matsOk = false;
    let raf    = null;

    const loop = () => {
      if (!running) return;               // stop if we’ve been turned off
      if (video.readyState < 2) {
        raf = requestAnimationFrame(loop);
        return;
      }

      // match canvas to video size
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width  = w;
      canvas.height = h;

      // (re)allocate Mats if size changed
      if (!matsOk || frameMat.cols !== w || frameMat.rows !== h) {
        frameMat?.delete();
        fgMat?.delete();
        contours?.delete();
        hierarchy?.delete();
        cap?.delete();
        backSub?.delete();

        frameMat  = new cv.Mat(h, w, cv.CV_8UC4);
        fgMat     = new cv.Mat();
        contours  = new cv.MatVector();
        hierarchy = new cv.Mat();
        cap       = new cv.VideoCapture(video);
        backSub   = new cv.BackgroundSubtractorMOG2();
        matsOk    = true;
      }

      // draw the live video into canvas
      ctx.drawImage(video, 0, 0, w, h);

      // grab & process frame
      cap.read(frameMat);
      backSub.apply(frameMat, fgMat);
      cv.findContours(
        fgMat, contours, hierarchy,
        cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE
      );

      // find largest contour
      let maxA = 0, maxC = null;
      for (let i = 0; i < contours.size(); i++) {
        const c = contours.get(i);
        const a = cv.contourArea(c);
        if (a > maxA) {
          maxA = a;
          maxC = c;
        }
      }

      if (maxC && maxA > 50) {
        const circle = cv.minEnclosingCircle(maxC);
        const cx     = circle.center.x;
        const cy     = circle.center.y;

        // update path
        let pts = pathRef.current;
        pts.push({ x: cx, y: cy });
        if (pts.length > MAX_PATH) pts = pts.slice(pts.length - MAX_PATH);
        pathRef.current = pts;
      }

      // --- OVERLAYS ---

      ctx.lineWidth = 2;

      // 1) center vertical line
      ctx.strokeStyle = 'orange';
      ctx.beginPath();
      ctx.moveTo(w/2, 0);
      ctx.lineTo(w/2, h);
      ctx.stroke();

      // 2) start-zone square (100px wide, anchored at bottom)
      const half = 50;
      const zx = w/2 - half;
      const zy = h - half*2;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(zx, zy, half*2, half*2);

      // 3) ball path
      const pts = pathRef.current;
      if (pts.length > 1) {
        ctx.strokeStyle = 'lightgreen';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    // CLEANUP on unmount / stop
    return () => {
      cancelAnimationFrame(raf);
      frameMat?.delete();
      fgMat?.delete();
      contours?.delete();
      hierarchy?.delete();
      cap?.delete();
      backSub?.delete();
    };
  }, [running]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: '#000',
      overflow: 'hidden'
    }}>
      {/* START BUTTON */}
      {!running && (
        <button
          onClick={() => setRunning(true)}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 2,
            padding: '1rem 2rem',
            fontSize: '1.5rem'
          }}
        >
          ▶️ Start Putting
        </button>
      )}

      {/* CAMERA SELECT */}
      <select
        value={facingMode}
        onChange={e => setFacingMode(e.target.value)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 2,
          padding: '0.5rem',
          fontSize: '1rem'
        }}
        disabled={running}
      >
        <option value="user">🤳 Front</option>
        <option value="environment">📷 Back</option>
      </select>

      {/* HIDDEN VIDEO, USED BY OPENCV */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />

      {/* VISIBLE CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%'
        }}
      />
    </div>
  );
}