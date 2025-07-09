import React, { useState } from "react";
import "../Styles/page-template.css";
import "../Styles/settings.css";
import TopNavbar from "../Components/TopNavbar";
import BottomNavbar from "../Components/BottomNavbar";

const Settings = () => {
  const [showEasySetup, setShowEasySetup] = useState(false);
  const [showExpertSetup, setShowExpertSetup] = useState(false);

  const handleEasySetup = () => {
    setShowEasySetup(true);
    setShowExpertSetup(false);
  };

  const handleExpertSetup = () => {
    setShowExpertSetup(true);
    setShowEasySetup(false);
  };

  const handleBack = () => {
    setShowEasySetup(false);
    setShowExpertSetup(false);
  };

  return (
    <div className="page-container">
     {showEasySetup ? "": <TopNavbar />
     }

      {showEasySetup ? (
        <div className="setup-content">
          {/* <button className="back-btn" onClick={handleBack}>
            ← Back to Settings
          </button> */}
          <iframe
            src="/index-2 (1).html"
            title="Easy Setup Guide"
            style={{
              width: "100%",
              height: "calc(100vh - 120px)",
              border: "none",
              marginTop: "20px",
            }}
          />
        </div>
      ) : showExpertSetup ? (
        <div className="setup-content">
          <button className="back-btn" onClick={handleBack}>
            ← Back to Settings
          </button>
          <iframe
            src="/index-2 (1).html"
            title="Expert Setup Guide"
            style={{
              width: "100%",
              height: "calc(100vh - 120px)",
              border: "none",
              marginTop: "20px",
            }}
          />
        </div>
      ) : (
        <>
          <h1 className="setting-heading-h-one">WEIGHTS BALANCE</h1>
          <div className="setting-first-div">
            <h2>
              EASY <span className="setting-span">SETUP</span>
            </h2>
          </div>
          <div className="setting-second-div">
            <p>
              Let's fine-tune your putter to match your feel. Hit a few putts on
              the green, tell us how it went and we'll guide you to the ideal
              balance.
            </p>
            <p>Quick, intuitive, and surprisingly accurat</p>
            <div className="auth-buttons">
              <button
                className="login-btn pad-but-setting"
                onClick={handleEasySetup}
              >
                START
              </button>
            </div>
          </div>

          <div className="setting-first-div">
            <h2>
              {" "}
              EXPERT <span className="setting-span">SETUP</span>
            </h2>
          </div>
          <div className="setting-second-div">
            <p>
              Ready to dial in your performance? Set up your phone on a tripod
              and let the AI analyze your stroke in real-time. From face angle
              to ball direction — we use data to define your optimal balance.
            </p>
            <div className="auth-buttons">
              <button
                className="login-btn pad-but-setting"
                // onClick={handleExpertSetup}
              >
                START
              </button>
            </div>
          </div>
        </>
      )}

{showEasySetup ? "": <BottomNavbar />
     }
    </div>
  );
};

export default Settings;
