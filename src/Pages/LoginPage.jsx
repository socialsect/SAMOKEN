import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoLanguage } from "react-icons/io5";
import '../Styles/LoginPage.css';
// import BottomNavbar from '../Components/BottomNavbar';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
   navigate('/initial');
  };

  return (
    <div className="auth-container">
      <button onClick={handleBack} className="back-button" aria-label="Go back">
        <IoIosArrowBack className="back-icon" />
      </button>
      
      <div className="auth-content">
        <img 
          src="/Logos/THE RUNNER-LOGOS-02.svg" 
          alt="RUNNER Logo" 
          className="auth-logo"
          width={280}
          height="auto"
        />
      
        <div className="auth-welcome-text">
          <h2>WELCOME BACK!</h2>
          <p>We're so excited to see you again!</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">EMAIL</label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <FaRegEye style={{ color: '#666', fontSize: '1.1rem' }} />
                ) : (
                  <FaRegEyeSlash style={{ color: '#666', fontSize: '1.1rem' }} />
                )}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ margin: '1.5rem 0' }}>
            <label className="checkbox-container">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="terms-text" style={{ fontSize: '0.9rem' }}>Remember me</span>
            </label>
          </div>

          <button type="submit" className="auth-btn login-submit-btn">
            LOG IN
          </button>
        </form>
      </div>

      <footer className="auth-footer">
  <IoLanguage  size={30}/>
        <div className="auth-help-privacy">
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </footer>
      {/* <BottomNavbar /> */}
    </div>
  );
};

export default LoginPage;
