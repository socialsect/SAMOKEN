import { useEffect, useRef } from 'react';

// For testing with hardcoded backend URL
const BACKEND_URL = 'http://localhost:8000/analyze-frame';

export default function useBallTracker(
  videoRef,
  canvasRef,
  running,
  onBall,      // callback(x, y)
  onComplete,  // callback({ avg, stddev, recommendation })
  onDetect,    // callback() when ball is detected
  intervalMs = 100
) {
  const timerRef = useRef();

  useEffect(() => {
    if (!running) {
      clearInterval(timerRef.current);
      return;
    }

    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d');

    timerRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      off.width  = video.videoWidth;
      off.height = video.videoHeight;
      offCtx.drawImage(video, 0, 0, off.width, off.height);

      off.toBlob(async (blob) => {
        if (!blob) {
          console.log('No blob created from canvas');
          return;
        }

        try {
          console.log('Creating FormData with frame');
          const form = new FormData();
          form.append('frame', blob, 'frame.jpg');
          
          console.log('Sending frame to backend:', BACKEND_URL);
          const startTime = Date.now();
          
          const resp = await fetch(BACKEND_URL, {
            method: 'POST',
            body: form,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          const responseTime = Date.now() - startTime;
          console.log(`Backend response (${responseTime}ms):`, resp.status, resp.statusText);

          if (!resp.ok) {
            const text = await resp.text();
            console.error('Backend error:', text);
            throw new Error(`${resp.status} ${resp.statusText}`);
          }

          const json = await resp.json();
          console.log('Tracker Response:', {
            ...json,
            hasXY: typeof json.x === 'number' && typeof json.y === 'number',
            hasPuttComplete: json.putt_complete === true
          });

          if (json.putt_complete) {
            console.log('Putt complete detected');
            onComplete({
              avg:            json.avg,
              stddev:         json.stddev,
              recommendation: json.recommendation
            });
          } else if (typeof json.x === 'number' && typeof json.y === 'number') {
            console.log('Ball detected at position:', { x: json.x, y: json.y });
            onDetect();
            onBall(json.x, json.y);
          } else {
            console.log('No ball detected in this frame');
          }
        } catch (err) {
          console.error('Tracker error:', err);
        }
      }, 'image/jpeg');
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [running, videoRef, onBall, onComplete, intervalMs]);
}