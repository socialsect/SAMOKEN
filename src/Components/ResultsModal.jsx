import React from 'react';
import PropTypes from 'prop-types';

export default function ResultsModal({ avg, stddev, recommendation, onProceed }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10
    }}>
      <h1>Stroke Analysis Complete</h1>
      <p><strong>Average Angle:</strong> {avg.toFixed(2)}°</p>
      <p><strong>Dispersion:</strong> {stddev.toFixed(2)}°</p>
      <p><strong>Recommendation:</strong> {recommendation}</p>
      <button onClick={onProceed} style={{
        marginTop: '20px',
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: '#00d084',
        color: '#000'
      }}>
        Proceed
      </button>
    </div>
  );
}

ResultsModal.propTypes = {
  avg: PropTypes.number.isRequired,
  stddev: PropTypes.number.isRequired,
  recommendation: PropTypes.string.isRequired,
  onProceed: PropTypes.func.isRequired
};