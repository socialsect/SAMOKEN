import { useEffect, useRef, useState } from 'react';
import { getCenterContour, getAngle, cleanupMats } from '../utils/cvUtils';

const useBallTracker = (videoRef, canvasRef, tracking, onComplete) => {
  const [putts, setPutts] = useState([]);
  const requestRef = useRef();
  const hiddenRef = useRef(false);
  const backSubRef = useRef(null);

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      hiddenRef.current = document.hidden;
    });
    return () => {
      document.removeEventListener('visibilitychange', () => {});
      stopTracking();
    };
  }, []);

  const stopTracking = () => {
    cancelAnimationFrame(requestRef.current);
    if (backSubRef.current) {
      backSubRef.current.delete();
      backSubRef.current = null;
    }
  };

  const process = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !tracking) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height || hiddenRef.current) {
      requestRef.current = requestAnimationFrame(process);
      return;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const frame = cv.matFromImageData(imageData);
    const fgMask = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    if (!backSubRef.current) {
      backSubRef.current = new cv.BackgroundSubtractorMOG2(500, 16, false);
    }
    backSubRef.current.apply(frame, fgMask);
    cv.findContours(fgMask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let puttInProgress = false;
    let previousX = null;

    if (contours.size() > 0) {
      const ball = getCenterContour(contours);
      if (ball) {
        const area = cv.contourArea(ball);
        const rect = cv.boundingRect(ball);
        const centerX = rect.x + rect.width / 2;
        const inStartZone =
          rect.y > height * 0.75 &&
          rect.y < height * 0.95 &&
          centerX > width / 2 - 50 &&
          centerX < width / 2 + 50;

        if (!puttInProgress && inStartZone) {
          puttInProgress = true;
          previousX = centerX;
        }

        if (puttInProgress && previousX && Math.abs(centerX - previousX) > 30) {
          const angle = getAngle(width / 2, height, centerX, rect.y);
          setPutts(prev => {
            const updated = [...prev, angle];
            if (updated.length === 5) {
              const avg = updated.reduce((a, b) => a + b) / 5;
              const stddev = Math.sqrt(
                updated.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / 5
              );
              let rec = 'Neutral';
              if (avg < -5) rec = 'Heavier Heel';
              else if (avg > 5) rec = 'Heavier Toe';
              else if (stddev > 15) rec = 'Standard';
              onComplete({ avg, stddev, recommendation: rec });
            }
            return updated;
          });
        }
        ball.delete();
      }
    }

    cleanupMats(frame, fgMask, contours, hierarchy);
    requestRef.current = requestAnimationFrame(process);
  };

  useEffect(() => {
    if (tracking) {
      requestRef.current = requestAnimationFrame(process);
    }
  }, [tracking]);

  return { putts, stopTracking };
};

export default useBallTracker;