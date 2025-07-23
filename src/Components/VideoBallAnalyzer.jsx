import React, { useRef, useState } from 'react';
import useCamera from '../hooks/useCamera';
import useBallTracker from '../hooks/useBallTracker';
import OverlayUI from './OverlayUI';
import ResultsModal from './ResultsModal';

export default function VideoBallAnalyzer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [tracking, setTracking] = useState(false);
  const { error } = useCamera(videoRef);
  const { putts, startTracking, stopTracking } = useBallTracker(videoRef, canvasRef, tracking, setResult);

  const handleStart = () => setTracking(true);
  const handleProceed = () => {
    setResult(null);
    setTracking(false);
    stopTracking();
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {error && <div style={{ color: 'red' }}>Camera Error: {error}</div>}

      <video
        ref={videoRef}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        muted
        playsInline
      />

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
      />

      {!tracking && !result && (
        <button
          onClick={handleStart}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '16px 32px',
            fontSize: '18px',
            backgroundColor: '#00d084',
            border: 'none',
            borderRadius: '10px',
            zIndex: 10,
            cursor: 'pointer',
          }}
        >
          Start Tracking
        </button>
      )}

      {tracking && !result && <OverlayUI puttCount={putts.length} />}
      {result && (
        <ResultsModal
          avg={result.avg}
          stddev={result.stddev}
          recommendation={result.recommendation}
          onProceed={handleProceed}
        />
      )}
    </div>
  );
}