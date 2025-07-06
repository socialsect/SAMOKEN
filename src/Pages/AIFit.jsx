import React, { useState } from "react";
import "../Styles/Ai-fit.css";
import { Link } from "react-router-dom";
import PuttingAnalyser from "../Components/PutterTracker";
import TopNavbar from "../Components/TopNavbar";
import BottomNavbar from "../Components/BottomNavbar";
const AIFit = () => {
  const [visible, setvisible] = useState(false);
  const makevisible = () => {
    setvisible(true);
  };
  return (
    <div className="page-container ai-fit-page">
      {!visible && <TopNavbar />}
      <div className="auth-content">
        {!visible && (
          <div className="auth-welcome-text">
            <h2>EASY AI FITTING</h2>
            <p>
              Every body is different. Every stroke is unique. That's why we
              created over 2,000 putter configurations and a smart AI quiz to
              help you find your perfect match. Let's get started
            </p>
            <button className="auth-btn" onClick={() => makevisible()}>
              START
            </button>
          </div>
        )}
        <div className="auth-form">{visible && <PuttingAnalyser />}</div>
      </div>
      {!visible && <BottomNavbar />}
    </div>
  );
};

export default AIFit;
