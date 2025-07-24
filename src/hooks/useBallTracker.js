// src/hooks/useBallTracker.js
import { useEffect, useRef } from 'react';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/analyze-frame`;

export default function useBallTracker(
  videoRef,
  canvasRef,
  running,
  onBall,      // callback(cx, cy)
  onComplete,  // callback({ avg, stddev, recommendation })
  intervalMs = 100
) {
  const timerRef = useRef();

  useEffect(() => {
    // if we're not running, clear our timer
    if (!running) {
      clearInterval(timerRef.current);
      return;
    }

    // create an offscreen canvas once
    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d');

    timerRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        // video not ready yet
        return;
      }

      // match offscreen canvas to the video size
      off.width  = video.videoWidth;
      off.height = video.videoHeight;
      offCtx.drawImage(video, 0, 0);

      // grab a JPEG blob of the current frame
      off.toBlob(async blob => {
        if (!blob) return;

        try {
          // POST the raw JPEG
          const resp = await fetch(BACKEND_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            body:    blob
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.error('Tracker 400:', text);
            throw new Error(`${resp.status} ${resp.statusText}`);
          }

          const json = await resp.json();
          console.log('Tracker JSON:', json);

          if (json.putt_complete) {
            onComplete({
              avg:            json.avg,
              stddev:         json.stddev,
              recommendation: json.recommendation
            });
          } else if (
            typeof json.x === 'number' &&
            typeof json.y === 'number'
          ) {
            onBall(json.x, json.y);
          }
        } catch (err) {
          console.error('Tracker error:', err);
        }
      }, 'image/jpeg');
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [running, videoRef, onBall, onComplete, intervalMs]);
}