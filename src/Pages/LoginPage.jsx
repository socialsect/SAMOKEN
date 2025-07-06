import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";
import "../Styles/LoginPage.css";
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
    navigate("/home");
  };

  return (
    <div className="login-container">
      <button
        onClick={handleBack}
        className="login-back-button"
        aria-label="Go back"
      >
        <IoIosArrowBack className="login-back-icon" />
      </button>

      <div className="login-content">
        <img
          src="/Logos/THE RUNNER-LOGOS-02.svg"
          alt="RUNNER Logo"
          className="login-logo"
          width={280}
          height="auto"
        />

        <div className="login-welcome-text">
          <h2>WELCOME BACK!</h2>
          <p>We're so excited to see you again!</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email" className="login-form-label">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="login-form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <label htmlFor="password" className="login-form-label">
                PASSWORD
              </label>
              <Link to="/forgot-password" className="login-forgot-password">
                Forgot Password?
              </Link>
            </div>
            <div className="login-password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaRegEye style={{ color: "#666", fontSize: "1.1rem" }} />
                ) : (
                  <FaRegEyeSlash
                    style={{ color: "#666", fontSize: "1.1rem" }}
                  />
                )}
              </button>
            </div>
          </div>

          <div className="login-form-group" style={{ margin: "1.5rem 0" }}>
            <label className="login-checkbox-container">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="login-checkmark"></span>
              <span className="login-terms-text" style={{ fontSize: "0.9rem" }}>
                Remember me
              </span>
            </label>
          </div>

          <button type="submit" className="login-btn">
            LOG IN
          </button>
        </form>
      </div>

      <footer className="login-footer">
        <IoLanguage size={30} />
        <div className="login-help-privacy">
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </footer>
      {/* <BottomNavbar /> */}
    </div>
  );
};

export default LoginPage;
