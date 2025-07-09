import React from "react";
import "../Styles/AuthPage.css";
import { Link } from "react-router-dom";

const AuthPage = () => {
  const handleWixLogin = () => {
    const clientId = "8def304e-af6a-4400-bc11-7f72c6d43837"; // your real clientId
    const redirectUri = "http://localhost:3000/auth/callback"; // must match one in Wix dev console
    const wixAuthUrl = `https://www.wix.com/installer/install?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code`;
    window.location.href = wixAuthUrl;
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <img
          src="/Logos/THE RUNNER-LOGOS-02.svg"
          alt="RUNNER Logo"
          className="auth-logo"
          width={400}
        />

        <div className="auth-welcome-text">
          <h2>WELCOME TO THE RUNNER APP</h2>
          <p>
            Join our community, find out which putter is your best fit, set it
            up and improve your putting!
          </p>
        </div>

        <div className="auth-buttons">
          <Link to="/signup">
            <button className="register-btn">REGISTER</button>
          </Link>
          <Link to="/login">
            <button className="login-btn">LOG IN</button>
          </Link>

          {/* ✅ Wix Login Button */}
          {/* <button
            onClick={handleWixLogin}
            className="login-btn"
            style={{ backgroundColor: "#4c4c4c", color: "white" }}
          >
            LOG IN WITH WIX
          </button> */}
        </div>
      </div>

      <footer className="auth-footer">
        <div className="auth-language-selector">
          <img src="icons/eng.png" alt="GB" className="lang-icon" />
        </div>
        <div className="auth-help-privacy">
          <a href="/help" className="auth-help-link">
            Help
          </a>
          <a href="/privacy" className="auth-privacy-link">
            Privacy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
