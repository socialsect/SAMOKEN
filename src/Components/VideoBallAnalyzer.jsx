// src/components/VideoBallAnalyzer.jsx
import React, { useRef, useState, useEffect } from 'react';
import useBallTracker from '../hooks/useBallTracker';

export default function VideoBallAnalyzer() {
  const videoRef  = useRef();
  const canvasRef = useRef();

  const [running, setRunning] = useState(false);
  const [facing,  setFacing]  = useState('environment');
  const [path,    setPath]    = useState([]);
  const [count,   setCount]   = useState(0);
  const [results, setResults] = useState(null);

  // 1) start/stop camera
  useEffect(() => {
    let stream;
    if (running) {
      (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facing,
              width:  { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (e) {
          console.error('Camera error', e);
          setRunning(false);
        }
      })();
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [running, facing]);

  // 2) hook → OpenCV + backend POSTs
  useBallTracker(
    videoRef,
    canvasRef,
    running,
    (x, y) => {
      setPath(p => {
        const next = [...p, { x, y }];
        return next.length > 100 ? next.slice(-100) : next;
      });
    },
    res => {
      setResults(res);
      setCount(5);
    }
  );

  // 3) update putt count live
  useEffect(() => {
    if (running && !results) {
      setCount(Math.min(5, Math.floor(path.length / 20)));
    }
  }, [path, running, results]);

  // 4) draw video frame + overlays into the canvas
  useEffect(() => {
    const c   = canvasRef.current;
    const ctx = c?.getContext('2d');
    let raf;

    function draw() {
      const v = videoRef.current;
      if (!v || v.readyState < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }

      // full-screen cover math
      const vw = v.videoWidth, vh = v.videoHeight;
      const cw = window.innerWidth, ch = window.innerHeight;
      c.width  = cw;
      c.height = ch;

      const scale   = Math.max(cw/vw, ch/vh);
      const sw      = vw * scale, sh = vh * scale;
      const sx      = (cw - sw) / 2, sy = (ch - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      if (facing === 'user') {
        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(v, 0, 0, vw, vh, sx, sy, sw, sh);
      if (facing === 'user') ctx.restore();

      // center line
      ctx.strokeStyle = 'orange';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(cw / 2, 0);
      ctx.lineTo(cw / 2, ch);
      ctx.stroke();

      // start-zone square
      ctx.strokeStyle = 'red';
      ctx.lineWidth   = 2;
      const size = 100;
      ctx.strokeRect(cw/2 - size/2, ch - size, size, size);

      // ball path
      if (path.length > 1) {
        ctx.strokeStyle = 'lightgreen';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [path, facing]);

  // shared styling for video + canvas
  const mediaStyle = {
    position:  'fixed',
    top:       0,
    left:      0,
    width:     '100vw',
    height:    '100vh',
    objectFit: 'cover',
    zIndex:    1
  };

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#000' }}>
      {/* controls before you start */}
      {!running && !results && (
        <div style={{ position:'absolute', top:20, left:20, zIndex:3 }}>
          <select value={facing} onChange={e => setFacing(e.target.value)}>
            <option value="environment">Back</option>
            <option value="user">Front</option>
          </select>
          <button onClick={() => setRunning(true)} style={{ marginLeft:10 }}>
            ▶️ Start Putting
          </button>
        </div>
      )}

      {/* live putt count */}
      {running && !results && (
        <div style={{
          position:'absolute', top:20, right:20,
          color:'#fff', background:'rgba(0,0,0,0.5)',
          padding:'0.5rem', borderRadius:4, zIndex:3
        }}>
          Putts: {count} / 5
        </div>
      )}

      {/* behind: native video element */}
      <video
        ref={videoRef}
        style={{
          ...mediaStyle,
          transform: facing === 'user' ? 'scaleX(-1)' : 'none'
        }}
        muted
        playsInline
        autoPlay
      />

      {/* on top: our canvas drawing both video frame + lines */}
      <canvas
        ref={canvasRef}
        style={mediaStyle}
      />

      {/* final modal */}
      {results && (
        <div style={{
          position:'absolute', top:0,left:0,
          width:'100%', height:'100%',
          background:'rgba(0,0,0,0.9)',
          color:'#fff', display:'flex',
          flexDirection:'column', justifyContent:'center',
          alignItems:'center', zIndex:4, textAlign:'center'
        }}>
          <h2>Analysis Complete</h2>
          <p>Average Angle: {results.avg.toFixed(1)}°</p>
          <p>Dispersion: {results.stddev.toFixed(1)}°</p>
          <p>Recommendation: {results.recommendation}</p>
          <button onClick={() => window.location.reload()}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}