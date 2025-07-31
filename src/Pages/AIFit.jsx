import React, { useState } from "react";
import "../Styles/Ai-fit.css";
import { Link ,useNavigate} from "react-router-dom";
import PuttingAnalyser from "../Components/PutterTracker";

import TopNavbar from "../Components/TopNavbar";
import BottomNavbar from "../Components/BottomNavbar";
const AIFit = () => {
  const navigate=useNavigate()
  const [visible, setvisible] = useState(false);
  const makevisible = () => {
    setvisible(true);
  };
  return (
    <div
      className={`page-container ai-fit-page${visible ? ' fullscreen-ai-fit' : ''}`}
      style={visible ? { padding: 0, margin: 0, width: '100vw', height: '100vh', minHeight: '100vh', background: '#000' } : {}}
    >
      {!visible && <TopNavbar />}
      <div className={`auth-content${visible ? ' fullscreen-ai-fit' : ''}`} style={visible ? { width: '100vw', height: '100vh', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' } : {}}>
        {!visible && (
          <div className="auth-welcome-text">
            <h2>EASY AI FITTING</h2>
            <p style={{fontFamily:"GoodTimes",color:"white",margin:"10px",textDecoration:"underline"}}><b>BOTH THE ALGORITHMS ARE IN DEVELOPMENT PHASE AND MAY NOT PERFORM THE EXACT WAY </b></p>
            <p>
              Every body is different. Every stroke is unique. That's why we
              created over 2,000 putter configurations and a smart AI quiz to
              help you find your perfect match. Let's get started
            </p>
            <button className="ai-fit-btn" onClick={() =>{navigate("/ball-tracker")}}>
          BALL TRACKER 
            </button>
            <button className="ai-fit-btn" onClick={()=>{navigate("/posture-detection")}}>Posture Detection Algorithm</button>
          </div>
        )}
        <div className={`auth-form${visible ? ' fullscreen-ai-fit' : ''}`} style={visible ? { width: '100vw', height: '100vh', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' } : {}}>
          {visible && <PuttingAnalyser />}
        </div>
      </div>
      {!visible && <BottomNavbar />}
    </div>
  );
};

export default AIFit;
