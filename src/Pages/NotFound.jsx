import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/NotFound.css';

const NotFound = () => {
  // Add animation effect for numbers
  useEffect(() => {
    const animateNumbers = () => {
      const numbers = document.querySelector('.error-code');
      if (numbers) {
        numbers.classList.add('animate');
      }
    };
    animateNumbers();
  }, []);

  return (
    <div className="not-found-container">
      <div className="luxury-overlay"></div>
      <div className="not-found-content">
        <div className="error-graphic">
          <div className="error-code">4 0 4</div>
          <div className="decoration-line"></div>
        </div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          The page you are looking for doesn't exist or has been moved.
          Let's get you back to where you belong.
        </p>
        <Link to="/home" className="luxury-button">
          <span className="button-text">Return to Home</span>
          <span className="button-icon">→</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
