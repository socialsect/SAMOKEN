import React from 'react';
import '../Styles/page-template.css';
import '../Styles/settings.css';

const Settings = () => {
  return (
    <div className="page-container">
      <h1 className='setting-heading-h-one'>WEIGHTS BALANCE</h1>
      <div className='setting-first-div'>
      <h2>EASY <span className='setting-span'>SETUP</span></h2>
      </div>
      <div className='setting-second-div'>
      <p>Let's fine-tune your putter to match your feel. Hit a few putts on the green, tell us how it went and we'll guide you to the ideal balance.</p>
      <p>Quick, intuitive, and surprisingly accurat</p>
        <div className="auth-buttons">
        <button className="login-btn pad-but-setting">START</button>
        </div>
      </div>

      <div className='setting-first-div'>
      <h2> EXPERT <span className='setting-span'>SETUP</span></h2>
      </div>
      <div className='setting-second-div'>
      <p>Ready to dial in your performance? Set up your phone on a tripod and let the AI analyze your stroke in real-time. From face angle to ball direction — we use data to define your optimal balance.</p>
        <div className="auth-buttons">
        <button className="login-btn pad-but-setting">START</button>
        </div>
      </div>
      {/* <img src="https://static.wixstatic.com/media/7c3902_c54f1a28c92d42e1965ddd21edff6e0a~mv2.gif" alt="PRO_BLADE_SITE2.gif" width="1360" height="578" 
      style={{width: "980px", height: "578px", objectFit: "cover", objectPosition: "50% 50%"}} 
      data-ssr-src-done="true" fetchpriority="low" loading="lazy" decoding="async"/> */}
    </div>
  );
};

export default Settings;
