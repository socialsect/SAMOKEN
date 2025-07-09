import React from 'react';
import '../Styles/training.css';
import TopNavbar from '../Components/TopNavbar';
import BottomNavbar from '../Components/BottomNavbar';
const Training = () => {
  return (
    <div className="training-container">
      <TopNavbar/>
      <div className='training-first-div'>
      <h2>TRAINING <span className='training-span'>1</span></h2>
      </div>
      <div className='training-second-div'>
      <p>Test your precision with 10 putts from 3 meters. The app analyzes your direction and dispersion to give you a score based on consistency and accuracy. Climb the leaderboard and share your results with friends.</p>
        <div className="auth-buttons">
        <button className="login-btn pad-but-training">START</button>
        </div>
      </div>

      <div className='training-first-div'>
      <h2> TRAINING <span className='training-span'>2</span></h2>
      </div>
      <div className='training-second-div'>
      <p>Find your perfect tempo. Using a top-down camera, the app measures the timing of your backswing and downswing on 10 putts. Aim for the ideal 2:1 rhythm ratio. Your average is scored and ranked — ready to challenge the leaderboard?</p>
        <div className="auth-buttons">
        <button className="login-btn pad-but-training">START</button>
        </div>
      </div>

      <div className='training-first-div'>
      <h2> TRAINING <span className='training-span'>3</span></h2>
      </div>
      <div className='training-second-div' id='training-lastdiv'>
      <p>Master your feel. Select a target distance and green speed, then let the camera analyze each putt. Your score is based on how accurately and consistently you match the target. Can you top the leaderboard?</p>
        <div className="auth-buttons">
        <button className="login-btn pad-but-training">START</button>
        </div>
      </div>
      <BottomNavbar/>
    </div>
  );
};

export default Training;