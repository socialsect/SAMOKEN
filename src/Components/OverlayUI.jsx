import React from 'react';
import PropTypes from 'prop-types';

export default function OverlayUI({ puttCount }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 2
    }}>
      {/* Putt Counter */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '16px'
      }}>
        Putts: {puttCount}/5
      </div>

      {/* Vertical Center Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        width: '2px',
        height: '100%',
        backgroundColor: 'red',
        transform: 'translateX(-1px)'
      }} />

      {/* Start Zone (green square) */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: 'calc(50% - 50px)',
        width: '100px',
        height: '100px',
        border: '2px solid lime',
        borderRadius: '8px'
      }} />
    </div>
  );
}

OverlayUI.propTypes = {
  puttCount: PropTypes.number.isRequired,
};