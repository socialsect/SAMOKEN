import React from 'react';
import '../Styles/Ai-fit.css';
import { Link } from 'react-router-dom';
import PutterTracker from '../Components/PutterTracker';
const AIFit = () => {
  return (
    <div className="page-container">
      <div className="auth-content">
        <div className="auth-welcome-text">
          <h2>EASY AI FITTING</h2>
          <p>Every body is different. Every stroke is unique. That's why we created over 2,000 putter configurations and a smart AI quiz to help you find your perfect match. Let's get started</p>
        </div>
        <div className="auth-form">
          <button className="auth-btn">
            <Link to="/login" className="login-link">START</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIFit;
