
import React, { useEffect, useRef, useState } from 'react';
import useBallTracker from '../hooks/useBallTracker';

export default function VideoBallAnalyzer() {
  const videoRef = useRef();
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  useBallTracker(videoRef, running, setResult);

  return (
    <div style={{ textAlign: 'center', color: 'white', backgroundColor: 'black', height: '100vh' }}>
      <h1>🏌️‍♂️ Golf Ball Tracker</h1>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: '90%' }} />
      <br />
      <button onClick={() => setRunning(r => !r)} style={{ marginTop: '1rem' }}>
        {running ? 'Stop' : 'Start'} Tracking
      </button>
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <p>Ball Detected: {result.detected ? '✅ Yes' : '❌ No'}</p>
          <p>Direction: {result.direction}</p>
        </div>
      )}
    </div>
  );
}