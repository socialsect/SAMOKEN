import React from 'react';
import '../Styles/DesktopHome.css';
// import logo from '../icons/logo.svg';

const DesktopHome = () => {
  return (
    <div className="desktop-home-container">
      <div className="desktop-home-left">
        <img src="/icons/logo.svg" alt="Runner Logo" className="desktop-home-logo" />
        <h1 className="desktop-home-title">RUNNER</h1>
        <p className="desktop-home-tagline">Elevate your game. Analyze your posture. Perfect your putt.</p>
        <div className="desktop-home-hero-placeholder">
          {/* Replace with animated posture detector or product preview */}
          <span>Hero Graphic / Product Preview</span>
        </div>
      </div>
      <div className="desktop-home-right">
        <div className="desktop-home-cta-box">
          <button className="desktop-home-btn desktop-home-btn-register">Register</button>
          <button className="desktop-home-btn desktop-home-btn-login">Log In</button>
        </div>
        <div className="desktop-home-highlights">
          <ul>
            <li>AI-powered posture analysis</li>
            <li>Personalized training insights</li>
            <li>Track your progress visually</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DesktopHome; 