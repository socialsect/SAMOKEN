import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import GolfLoader from './golfloader';
const SMOOTHING_BUFFER_SIZE = 5;

export default function FullscreenPostureAnalyzer() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const detectorRef = useRef(null);

  const [posture,    setPosture]    = useState('Ready to start');
  const [facingMode, setFacingMode] = useState('user');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [isStarted,  setIsStarted]  = useState(false);
  const [capturedPosture, setCapturedPosture] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState('manual'); // 'manual', 'timer'
  const [countdown, setCountdown] = useState(0);
  const [autoCaptureTimer, setAutoCaptureTimer] = useState(null);
  const [showCapturing, setShowCapturing] = useState(false);
  const [showCapturedModal, setShowCapturedModal] = useState(false);
  const [lastTimerSeconds, setLastTimerSeconds] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        detectorRef.current = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          { modelType: posedetection.movenet.modelType.LIGHTNING }
        );
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Failed to init pose detector');
        setLoading(false);
      }
    })();
    return stopCamera;
  }, []);

  useEffect(() => {
    if (detectorRef.current && isStarted) startCamera();
  }, [facingMode, isStarted]);



  // Auto-capture timer
  useEffect(() => {
    if (captureMode === 'timer' && isStarted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Show capturing message for 1 second, then keep it open showing result
            setShowCapturing(true);
            setTimeout(() => {
              handleCapturePosture();
              // keep showCapturing true so user can see result + actions
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown, captureMode, isStarted]);

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
        setPosture('Detecting...');
        detectLoop();
      };
    } catch (e) {
      console.error(e);
      setError('Camera access denied');
      setLoading(false);
    }
  }

  function handleStartDetection() {
    setIsStarted(true);
  }

  function handleStopDetection() {
    setIsStarted(false);
    stopCamera();
    setPosture('Ready to start');
    setCapturedPosture(null);
    setCountdown(0);
    setCaptureMode('manual');
    setShowCapturing(false);
    setShowCapturedModal(false);
    setLastTimerSeconds(null);
  }

  function handleCapturePosture() {
    setIsCapturing(true);
    // Capture current posture data
    const currentPostureData = {
      posture: posture,
      timestamp: new Date().toISOString(),
      angle: posture.includes('°') ? parseFloat(posture.split('°')[0].split('|')[1].trim()) : null,
      category: posture.includes('|') ? posture.split('|')[0].trim() : 'Unknown'
    };
    setCapturedPosture(currentPostureData);
    setShowCapturedModal(true);
    
    // Show capture feedback
    setTimeout(() => {
      setIsCapturing(false);
    }, 2000);
  }

  function startTimerCapture(seconds) {
    setCaptureMode('timer');
    setCountdown(seconds);
    setLastTimerSeconds(seconds);
    setShowCapturedModal(false);
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
      if (!detectorRef.current || !v) return;
      // Pause drawing updates when captured modal is showing to freeze background
      const freeze = showCapturedModal || showCapturing;

      // cover-style math
      const vw = v.videoWidth, vh = v.videoHeight;
      const cw = c.width,       ch = c.height;
      const scale   = Math.max(cw/vw, ch/vh);
      const offsetX = (cw - vw*scale) / 2;
      const offsetY = (ch - vh*scale) / 2;

      // clear & mirror if front camera
      ctx.clearRect(0,0,cw,ch);
      if (facingMode === 'user') {
        ctx.save();
        ctx.scale(-1,1);
        ctx.translate(-cw,0);
      }

      // draw video "cover"
      if (!freeze) {
        ctx.drawImage(
          v,
          0, 0, vw, vh,
          offsetX, offsetY,
          vw * scale,
          vh * scale
        );
      }

      // pose estimation
      if (!freeze) {
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
              x: p.x * scale + offsetX,
              y: p.y * scale + offsetY,
              name: p.name,
              score: p.score
            }));
            drawOverlay(ctx, mapped, cat);
          }
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
    const a = getKeypoint(kps,'left_ankle','right_ankle');
    
    const color = label==='Upright' ? 'lime'
                : label==='Normal'  ? 'orange'
                                    : 'red';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Draw shoulder to hip line (existing line)
    if (s && h) {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(h.x, h.y);
      ctx.stroke();
    }
    
    // Draw hip to ankle line (new line)
    if (h && a) {
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(a.x, a.y);
      ctx.stroke();
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: '#000', overflow: 'hidden',
      fontFamily: 'Avenir, sans-serif'
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
          left: '50%',
          transform: 'translateX(-50%)',
          height: '100vh',
          width: 'auto',
          display: isStarted ? 'block' : 'none'
        }}
      />

      {/* Loading Overlay */}
      {loading && <GolfLoader/>}

      {/* Start Detection Button or Results */}
      {!loading && !isStarted && !showCapturing && !showCapturedModal && (
         <div style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           zIndex: 15,
           textAlign: 'center'
         }}>
           {capturedPosture ? (
             // Show Results
             <div style={{
               background: 'rgba(0, 0, 0, 0.9)',
               border: '3px solid #CB0000',
               borderRadius: '16px',
               padding: '40px',
               backdropFilter: 'blur(10px)',
               maxWidth: '500px',
               margin: '0 20px'
             }}>
               <div style={{
                 fontFamily: 'GoodTimes, monospace',
                 color: '#CB0000',
                 fontSize: '1.5rem',
                 marginBottom: '20px',
                 textAlign: 'center'
               }}>
                 POSTURE ANALYSIS RESULTS
               </div>
               
               <div style={{
                 background: 'rgba(255, 255, 255, 0.1)',
                 borderRadius: '12px',
                 padding: '24px',
                 marginBottom: '24px',
                 border: '2px solid rgba(203, 0, 0, 0.3)'
               }}>
                 <div style={{
                   color: '#fff',
                   fontSize: '1.3rem',
                   fontWeight: 'bold',
                   marginBottom: '8px',
                   textAlign: 'center',
                   fontFamily: 'Avenir, sans-serif'
                 }}>
                   {capturedPosture.category}
                 </div>
                 <div style={{
                   color: '#CB0000',
                   fontSize: '1.1rem',
                   textAlign: 'center',
                   fontFamily: 'GoodTimes, monospace',
                   marginBottom: '16px'
                 }}>
                   {capturedPosture.angle ? `${capturedPosture.angle.toFixed(1)}°` : 'N/A'}
                 </div>
                 
                 <div style={{
                   display: 'flex',
                   justifyContent: 'center',
                   marginBottom: '16px'
                 }}>
                   <div style={{
                     width: '60px',
                     height: '8px',
                     background: capturedPosture.category === 'Upright' ? 'lime' : 
                               capturedPosture.category === 'Normal' ? 'orange' : 'red',
                     borderRadius: '4px'
                   }}></div>
                 </div>
                 
                 <div style={{
                   color: '#ccc',
                   fontSize: '0.9rem',
                   textAlign: 'center',
                   fontFamily: 'Avenir, sans-serif',
                   lineHeight: '1.4'
                 }}>
                   {capturedPosture.category === 'Upright' ? 
                     'Excellent posture! Keep up the good work.' :
                     capturedPosture.category === 'Normal' ? 
                     'Good posture with room for improvement.' :
                     'Consider adjusting your posture for better health.'
                   }
                 </div>
               </div>
               
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                 <button
                    onClick={handleStartDetection}
                   style={{
                     background: 'linear-gradient(135deg, #CB0000, #A00000)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     padding: '12px 24px',
                     fontSize: '1rem',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     textTransform: 'uppercase',
                     letterSpacing: '1px',
                     fontFamily: 'GoodTimes, monospace'
                   }}
                   onMouseOver={(e) => {
                     e.target.style.transform = 'translateY(-1px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(203, 0, 0, 0.3)';
                   }}
                   onMouseOut={(e) => {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   Try Again
                 </button>
                 <button
                    onClick={() => {
                      const mapCategoryToId = (cat) => {
                        const key = String(cat || '').toUpperCase();
                        if (key.includes('UPRIGHT')) return 255588;
                        if (key.includes('NORMAL')) return 255589;
                        if (key.includes('CROUCHED')) return 255590;
                        return null;
                      };
                      const answerId = mapCategoryToId(capturedPosture?.category);
                      if (answerId != null) {
                        try {
                          sessionStorage.setItem('posture_result', JSON.stringify({ answerId, ts: Date.now() }));
                        } catch {}
                      }
                      window.history.back();
                    }}
                   style={{
                     background: 'linear-gradient(135deg, #008000, #006000)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     padding: '12px 24px',
                     fontSize: '1rem',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     textTransform: 'uppercase',
                     letterSpacing: '1px',
                     fontFamily: 'GoodTimes, monospace'
                   }}
                   onMouseOver={(e) => {
                     e.target.style.transform = 'translateY(-1px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(0, 128, 0, 0.3)';
                   }}
                   onMouseOut={(e) => {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   Submit
                 </button>
                 <button
                   onClick={() => window.history.back()}
                   style={{
                     background: 'rgba(255, 255, 255, 0.1)',
                     color: 'white',
                     border: '2px solid #CB0000',
                     borderRadius: '8px',
                     padding: '12px 24px',
                     fontSize: '1rem',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     textTransform: 'uppercase',
                     letterSpacing: '1px',
                     fontFamily: 'GoodTimes, monospace'
                   }}
                   onMouseOver={(e) => {
                     e.target.style.transform = 'translateY(-1px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(203, 0, 0, 0.3)';
                   }}
                   onMouseOut={(e) => {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   Back
                 </button>
               </div>
             </div>
           ) : (
             // Show Start Screen
             <div style={{
               background: 'rgba(0, 0, 0, 0.9)',
               border: '3px solid #CB0000',
               borderRadius: '16px',
               padding: '40px',
               backdropFilter: 'blur(10px)',
               maxWidth: '400px',
               margin: '0 20px'
             }}>
               <div style={{
                 fontFamily: 'GoodTimes, monospace',
                 color: '#CB0000',
                 fontSize: '1.5rem',
                 marginBottom: '20px',
                 textAlign: 'center'
               }}>
                 AI POSTURE DETECTOR
               </div>
               <div style={{
                 color: '#fff',
                 fontSize: '1.1rem',
                 marginBottom: '30px',
                 lineHeight: '1.5',
                 fontFamily: 'Avenir, sans-serif'
               }}>
                                Get ready to analyze your posture with our state-of-the-art AI technology
             </div>
             
             {/* Capture Mode Selection */}
             <div style={{
               marginBottom: '24px',
               textAlign: 'center'
             }}>
               <div style={{
                 color: '#CB0000',
                 fontSize: '1rem',
                 marginBottom: '12px',
                 fontFamily: 'GoodTimes, monospace'
               }}>
                 CAPTURE MODE
               </div>
               <div style={{
                 display: 'flex',
                 gap: '8px',
                 justifyContent: 'center',
                 flexWrap: 'wrap'
               }}>
                 <button
                   onClick={() => setCaptureMode('manual')}
                   style={{
                     background: captureMode === 'manual' ? '#CB0000' : 'rgba(255, 255, 255, 0.1)',
                     color: 'white',
                     border: '2px solid #CB0000',
                     borderRadius: '6px',
                     padding: '8px 16px',
                     fontSize: '0.9rem',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     fontFamily: 'GoodTimes, monospace'
                   }}
                 >
                   Manual
                 </button>
                 <button
                   onClick={() => setCaptureMode('timer')}
                   style={{
                     background: captureMode === 'timer' ? '#CB0000' : 'rgba(255, 255, 255, 0.1)',
                     color: 'white',
                     border: '2px solid #CB0000',
                     borderRadius: '6px',
                     padding: '8px 16px',
                     fontSize: '0.9rem',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     fontFamily: 'GoodTimes, monospace'
                   }}
                 >
                   Timer
                 </button>
               </div>
             </div>
             
             <button
               onClick={handleStartDetection}
               style={{
                 background: 'linear-gradient(135deg, #CB0000, #A00000)',
                 color: 'white',
                 border: 'none',
                 borderRadius: '8px',
                 padding: '16px 32px',
                 fontSize: '1.2rem',
                 fontWeight: 'bold',
                 cursor: 'pointer',
                 transition: 'all 0.3s ease',
                 textTransform: 'uppercase',
                 letterSpacing: '1px',
                 fontFamily: 'GoodTimes, monospace',
                 minWidth: '200px'
               }}
               onMouseOver={(e) => {
                 e.target.style.transform = 'translateY(-2px)';
                 e.target.style.boxShadow = '0 8px 20px rgba(203, 0, 0, 0.4)';
               }}
               onMouseOut={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = 'none';
               }}
             >
               Start Detection
             </button>
             </div>
           )}
         </div>
       )}

        {/* Timer Countdown Display */}
       {isStarted && captureMode === 'timer' && countdown > 0 && !showCapturing && (
         <div style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           zIndex: 4,
           textAlign: 'center'
         }}>
           <div style={{
             background: 'rgba(0, 0, 0, 0.9)',
             border: '3px solid #CB0000',
             borderRadius: '50%',
             width: '120px',
             height: '120px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             backdropFilter: 'blur(10px)'
           }}>
             <div style={{
               fontFamily: 'GoodTimes, monospace',
               color: '#CB0000',
               fontSize: '3rem',
               fontWeight: 'bold'
             }}>
               {countdown}
             </div>
           </div>
         </div>
       )}

      {/* Capturing Message + Quick Result */}
      {isStarted && showCapturing && (
         <div style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           zIndex: 10,
           textAlign: 'center'
         }}>
           <div style={{
             background: 'rgba(0, 0, 0, 0.9)',
             border: '3px solid #008000',
             borderRadius: '16px',
            padding: '24px 28px',
             backdropFilter: 'blur(10px)',
            maxWidth: '360px',
             margin: '0 20px'
           }}>
             <div style={{
               fontFamily: 'GoodTimes, monospace',
               color: '#008000',
              fontSize: '1.3rem',
              marginBottom: '10px',
               textAlign: 'center'
             }}>
              Analysis Successful
             </div>
            {capturedPosture && (
              <div>
                <div style={{
                  color: '#fff',
                  fontSize: '1rem',
                  textAlign: 'center',
                  fontFamily: 'Avenir, sans-serif',
                  marginBottom: '8px'
                }}>
                  Your posture is <span style={{color: 'red', fontSize: '1.5rem',fontFamily:'GoodTimes, monospace'}}> {capturedPosture.category}</span>
                </div>
                {capturedPosture.angle != null && (
                  <div style={{
                    color: '#8fe18f',
                    fontSize: '0.95rem',
                    textAlign: 'center',
                    fontFamily: 'GoodTimes, monospace',
                    marginBottom: '12px'
                  }}>
                    {capturedPosture.angle.toFixed(1)}°
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      // Map category to quiz option id and store for Quiz to consume
                      const mapCategoryToId = (cat) => {
                        const key = String(cat || '').toUpperCase();
                        if (key.includes('UPRIGHT')) return 255588;
                        if (key.includes('NORMAL')) return 255589;
                        if (key.includes('CROUCHED')) return 255590;
                        return null;
                      };
                      const answerId = mapCategoryToId(capturedPosture?.category);
                      if (answerId != null) {
                        try {
                          sessionStorage.setItem('posture_result', JSON.stringify({ answerId, ts: Date.now() }));
                        } catch {}
                      }
                      window.history.back();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #008000, #006000)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: 'GoodTimes, monospace'
                    }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setShowCapturing(false);
                      setCapturedPosture(null);
                      if (captureMode === 'timer') {
                        setCountdown(0);
                      }
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                      border: '2px solid #CB0000',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: 'GoodTimes, monospace'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
           </div>
         </div>
       )}

      {/* Timer Controls */}
      {isStarted && captureMode === 'timer' && countdown === 0 && !showCapturing && !showCapturedModal && (
         <div style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           zIndex: 4,
           textAlign: 'center'
         }}>
           <div style={{
             background: 'rgba(0, 0, 0, 0.9)',
             border: '3px solid #CB0000',
             borderRadius: '16px',
             padding: '24px',
             backdropFilter: 'blur(10px)',
             maxWidth: '300px',
             margin: '0 20px'
           }}>
             <div style={{
               fontFamily: 'GoodTimes, monospace',
               color: '#CB0000',
               fontSize: '1.2rem',
               marginBottom: '16px',
               textAlign: 'center'
             }}>
               SET TIMER
             </div>
             <div style={{
               display: 'flex',
               gap: '8px',
               justifyContent: 'center',
               flexWrap: 'wrap',
               marginBottom: '16px'
             }}>
               {[3, 5, 7, 10].map(seconds => (
                 <button
                   key={seconds}
                   onClick={() => startTimerCapture(seconds)}
                   style={{
                     background: '#CB0000',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     padding: '8px 12px',
                     fontSize: '0.9rem',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     fontFamily: 'GoodTimes, monospace',
                     minWidth: '40px'
                   }}
                   onMouseOver={(e) => {
                     e.target.style.transform = 'translateY(-1px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(203, 0, 0, 0.3)';
                   }}
                   onMouseOut={(e) => {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   {seconds}s
                 </button>
               ))}
             </div>
             <button
               onClick={() => setCaptureMode('manual')}
               style={{
                 background: 'rgba(255, 255, 255, 0.1)',
                 color: 'white',
                 border: '2px solid #CB0000',
                 borderRadius: '6px',
                 padding: '8px 16px',
                 fontSize: '0.9rem',
                 fontWeight: 'bold',
                 cursor: 'pointer',
                 transition: 'all 0.3s ease',
                 fontFamily: 'GoodTimes, monospace'
               }}
             >
               Back to Manual
             </button>
           </div>
         </div>
       )}

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
            padding: '12px 16px',
            fontSize: '1rem',
            fontFamily: 'Avenir, sans-serif',
            fontWeight: '600',
            borderRadius: '8px',
            border: '2px solid #CB0000',
            background: 'white',
            color: '#000',
            cursor: 'pointer',
            minWidth: '160px',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: isStarted ? 'block' : 'none'
          }}
        >
          <option value="user">🤳 Front Camera</option>
          <option value="environment">📷 Back Camera</option>
        </select>

        <div style={{
          pointerEvents: 'none',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #CB0000',
          borderRadius: '8px',
          padding: '12px 20px',
          backdropFilter: 'blur(10px)',
          display: isStarted ? 'block' : 'none'
        }}>
          <div style={{
            fontFamily: 'GoodTimes, monospace',
            color: '#CB0000',
            fontSize: '0.9rem',
            marginBottom: '4px',
            textAlign: 'center'
          }}>
            POSTURE STATUS
          </div>
          <div style={{
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {loading ? 'Initializing...' : posture}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: isStarted ? 'flex' : 'none',
        gap: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #CB0000',
        borderRadius: '8px',
        padding: '12px 20px',
        backdropFilter: 'blur(10px)',
        zIndex: 2
      }}>
        <div style={{
          fontFamily: 'GoodTimes, monospace',
          color: '#CB0000',
          fontSize: '0.8rem',
          marginBottom: '8px',
          textAlign: 'center',
          width: '100%'
        }}>
          POSTURE LEGEND
        </div>
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '4px',
              background: 'lime',
              borderRadius: '2px'
            }}></div>
            <span style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: 'Avenir, sans-serif'
            }}>Upright</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '4px',
              background: 'orange',
              borderRadius: '2px'
            }}></div>
            <span style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: 'Avenir, sans-serif'
            }}>Normal</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '4px',
              background: 'red',
              borderRadius: '2px'
            }}></div>
            <span style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontFamily: 'Avenir, sans-serif'
            }}>Crouched</span>
          </div>
        </div>
      </div>

             {/* Control Buttons */}
       {isStarted && (
         <div style={{
           position: 'absolute',
           top: 20,
           right: 20,
           zIndex: 3,
           display: 'flex',
           gap: '12px'
         }}>
           {captureMode === 'manual' && (
             <button
               onClick={handleCapturePosture}
               disabled={isCapturing || !posture.includes('°')}
               style={{
                 background: isCapturing ? 'rgba(0, 128, 0, 0.9)' : 'rgba(0, 128, 0, 0.9)',
                 color: 'white',
                 border: '2px solid #008000',
                 borderRadius: '8px',
                 padding: '12px 20px',
                 fontSize: '1rem',
                 fontWeight: 'bold',
                 cursor: isCapturing || !posture.includes('°') ? 'not-allowed' : 'pointer',
                 transition: 'all 0.3s ease',
                 textTransform: 'uppercase',
                 letterSpacing: '1px',
                 fontFamily: 'GoodTimes, monospace',
                 backdropFilter: 'blur(10px)',
                 opacity: isCapturing || !posture.includes('°') ? 0.6 : 1
               }}
               onMouseOver={(e) => {
                 if (!isCapturing && posture.includes('°')) {
                   e.target.style.transform = 'translateY(-1px)';
                   e.target.style.boxShadow = '0 4px 12px rgba(0, 128, 0, 0.3)';
                 }
               }}
               onMouseOut={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = 'none';
               }}
             >
               {isCapturing ? 'Captured!' : 'Capture'}
             </button>
           )}
           <button
             onClick={handleStopDetection}
             style={{
               background: 'rgba(203, 0, 0, 0.9)',
               color: 'white',
               border: '2px solid #CB0000',
               borderRadius: '8px',
               padding: '12px 20px',
               fontSize: '1rem',
               fontWeight: 'bold',
               cursor: 'pointer',
               transition: 'all 0.3s ease',
               textTransform: 'uppercase',
               letterSpacing: '1px',
               fontFamily: 'GoodTimes, monospace',
               backdropFilter: 'blur(10px)'
             }}
             onMouseOver={(e) => {
               e.target.style.transform = 'translateY(-1px)';
               e.target.style.boxShadow = '0 4px 12px rgba(203, 0, 0, 0.3)';
             }}
             onMouseOut={(e) => {
               e.target.style.transform = 'translateY(0)';
               e.target.style.boxShadow = 'none';
             }}
           >
             Stop
           </button>
         </div>
       )}

      {error && (
        <div style={{
          position: 'absolute',
          bottom: 20, left: 20, right: 20,
          background: 'rgba(203, 0, 0, 0.9)',
          border: '2px solid #CB0000',
          borderRadius: '8px',
          padding: '16px 20px',
          backdropFilter: 'blur(10px)',
          zIndex: 2
        }}>
          <div style={{
            fontFamily: 'GoodTimes, monospace',
            color: '#fff',
            fontSize: '0.9rem',
            marginBottom: '4px',
            textAlign: 'center'
          }}>
            ERROR
          </div>
          <div style={{
            color: '#fff',
            fontSize: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}