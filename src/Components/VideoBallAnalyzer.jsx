import React, { useRef, useState, useEffect } from 'react';
import useBallTracker from '../hooks/useBallTracker';

export default function VideoBallAnalyzer() {
  const videoRef  = useRef();
  const canvasRef = useRef();

  const [running,  setRunning]  = useState(false);
  const [facing,   setFacing]   = useState('environment');
  const [path,     setPath]     = useState([]);
  const [count,    setCount]    = useState(0);
  const [results,  setResults]  = useState(null);
  const [justDetected, setJustDetected] = useState(false);

  // 1) start / stop camera
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
    },
    () => {
      setJustDetected(true);
      setTimeout(() => setJustDetected(false), 2000);
    }
  );

  // 3) live putt count
  useEffect(() => {
    if (running && !results) {
      setCount(Math.min(5, Math.floor(path.length / 20)));
    }
  }, [path, running, results]);

  // 4) draw into canvas: full-screen video cover + center line + start zone + ball path
  useEffect(() => {
    const c   = canvasRef.current;
    const ctx = c.getContext('2d');
    let raf;

    function draw() {
      const v = videoRef.current;
      if (!v || v.readyState < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }

      // cover‐style math
      const vw = v.videoWidth, vh = v.videoHeight;
      const cw = window.innerWidth, ch = window.innerHeight;
      c.width  = cw;
      c.height = ch;
      const scale = Math.max(cw/vw, ch/vh);
      const sw = vw * scale, sh = vh * scale;
      const sx = (cw - sw)/2, sy = (ch - sh)/2;

      ctx.clearRect(0, 0, cw, ch);
      if (facing === 'user') {
        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1,1);
      }
      ctx.drawImage(v, 0,0, vw,vh, sx,sy, sw,sh);
      if (facing === 'user') ctx.restore();

      // center line
      ctx.strokeStyle = 'orange';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(cw/2, 0);
      ctx.lineTo(cw/2, ch);
      ctx.stroke();

      // start-zone square
      ctx.strokeStyle = 'red';
      ctx.lineWidth   = 2;
      const S = 200;
      ctx.strokeRect(cw/2 - S/2, ch - S, S, S);

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

  return (
    <div style={{
      position:'fixed', top:0,left:0,
      width:'100vw', height:'100vh',
      background:'#000', overflow:'hidden'
    }}>
      {/* controls */}
      {!running && !results && (
        <div style={{ position:'absolute', top:20, left:20, zIndex:3 }}>
          <select value={facing} onChange={e=>setFacing(e.target.value)}>
            <option value="environment">Back</option>
            <option value="user">Front</option>
          </select>
          <button
            onClick={()=>setRunning(true)}
            style={{ marginLeft:10 }}
          >
            ▶️ Start Putting
          </button>
        </div>
      )}

      {/* live counter */}
      {running && !results && (
        <div style={{
          position:'absolute', top:20, right:20,
          color:'#fff', background:'rgba(0,0,0,0.5)',
          padding:'0.5rem', borderRadius:4, zIndex:3
        }}>
          Putts: {count} / 5
        </div>
      )}

      {/* ball detection feedback */}
      {justDetected && (
        <div style={{
          position: 'absolute', 
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,255,0,0.8)',
          padding: '1rem 2rem',
          borderRadius: 8,
          color: '#000',
          zIndex: 10,
          pointerEvents: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          🏀 Ball Detected!
        </div>
      )}

      {/* video & overlay */}
      <video
        ref={videoRef}
        muted playsInline autoPlay
        style={{
          position:'fixed', top:0,left:0,
          width:'100vw', height:'100vh',
          objectFit:'cover',
          transform: facing==='user' ? 'scaleX(-1)' : 'none',
          zIndex:1
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position:'fixed', top:0,left:0,
          width:'100vw', height:'100vh',
          pointerEvents:'none',
          zIndex:2
        }}
      />

      {/* results modal */}
      {results && (
        <div style={{
          position:'absolute', top:0,left:0,
          width:'100%', height:'100%',
          background:'rgba(0,0,0,0.9)',
          color:'#fff', display:'flex',
          flexDirection:'column', justifyContent:'center',
          alignItems:'center', textAlign:'center',
          zIndex:4
        }}>
          <h2>Analysis Complete</h2>
          <p>Average Angle: {results.avg.toFixed(1)}°</p>
          <p>Dispersion: {results.stddev.toFixed(1)}°</p>
          <p>Recommendation: {results.recommendation}</p>
          <button onClick={()=>window.location.reload()}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}