import React, { useState } from "react";
import "../Styles/profile.css";
import TopNavbar from "../Components/TopNavbar";
import { usePuttingMetrics } from "../contexts/PuttingMetricsContext";

const Profile = () => {
  const { puttingMetrics, updateMetric } = usePuttingMetrics();
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="profile-page-container profile-page-with-navbar-gap">
      <TopNavbar />

      {/* Disclaimer for user experience */}
   

      {/* Profile Info */}
      <div className="profile-info">
        <img
          src="/images/simon.png"
          alt="Profile"
          className="profile-avatar"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowFullImage(true)}
        />
        <div className="profile-info-details">
          <div className="profile-name">SIMON</div>
          <div className="profile-level">ADVANCED</div>
          <div className="profile-hcp">
            <span className="profile-label">Hcp: </span>
            <span className="profile-value red">9.8</span>
          </div>
          <div className="profile-location">
            <span className="profile-label">Location: </span>
            <span className="profile-value red">SAINT ARNAOULT FR</span>
          </div>
        </div>
      </div>
      <div className="putting-disclaimer">
        <small>
          <span role="img" aria-label="info">ℹ️</span> Check the boxes below to choose which metrics are displayed in the MY PUTTING section on your homepage.
        </small>
      </div>
      {/* Fullscreen Image Modal */}
      {showFullImage && (
        <div className="profile-img-modal" onClick={() => setShowFullImage(false)}>
          <img src="/images/simon.png" alt="Profile Fullscreen" className="profile-img-fullscreen" />
          <button className="profile-img-close" onClick={() => setShowFullImage(false)}>&times;</button>
        </div>
      )}

      {/* MY PUTTING SECTION */}
      <div className="profile-section">
        <div className="section-title">MY <span id="white">PUTTING</span></div>

        <div className="putting-top">
          <div className="putting-item">
            <div className="putting-title">ARC TYPE</div>
            <img src="/images/arc.png" alt="Arc Type" className="putting-icon" />
            <div className="putting-value" id="squareto">square to slight arc</div>
            <label className="putting-checkbox">
              <input 
                type="checkbox" 
                checked={puttingMetrics.arcType}
                onChange={() => updateMetric('arcType', !puttingMetrics.arcType)}
              />
              <span className="checkmark"></span>
            </label>
          </div>

          <div className="putting-item">
            <div className="putting-title">AVG FACE ANGLE</div>
            <div className="putting-value red">0.4° <span id="red"> R</span></div>
            <label className="putting-checkbox">
              <input 
                type="checkbox" 
                checked={puttingMetrics.faceAngle}
                onChange={() => updateMetric('faceAngle', !puttingMetrics.faceAngle)}
              />
              <span className="checkmark"></span>
            </label>
          </div>

          <div className="putting-item">
            <div className="putting-title">AVG BALL DIRECTION</div>
            <div className="putting-value red">0.6° <span id="red"> L</span></div>
            <label className="putting-checkbox">
              <input 
                type="checkbox" 
                checked={puttingMetrics.ballDirection}
                onChange={() => updateMetric('ballDirection', !puttingMetrics.ballDirection)}
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>

        <div className="putting-bottom">
          <div className="putting-item">
            <div className="putting-title">STROKE RATIO</div>
            <div className="putting-value">1:1</div>
            <label className="putting-checkbox">
              <input 
                type="checkbox" 
                checked={puttingMetrics.strokeRatio}
                onChange={() => updateMetric('strokeRatio', !puttingMetrics.strokeRatio)}
              />
              <span className="checkmark"></span>
            </label>
          </div>
          <div className="putting-item">
            <div className="putting-title">DYNAMIC CONTROL</div>
            <div className="putting-value red">78 <span id="red"> %</span></div>
            <label className="putting-checkbox">
              <input 
                type="checkbox" 
                checked={puttingMetrics.dynamicControl}
                onChange={() => updateMetric('dynamicControl', !puttingMetrics.dynamicControl)}
              />
              <span className="checkmark"></span>
            </label>
          </div>
          <div className="putting-item">
            <div className="putting-title">PUTT PERFORMANCE</div>
            <div className="putting-value red">84 <span id="red"> %</span></div>
            <label className="putting-checkbox">
              <input 
                type="checkbox" 
                checked={puttingMetrics.puttPerformance}
                onChange={() => updateMetric('puttPerformance', !puttingMetrics.puttPerformance)}
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
      </div>

      {/* MY PUTTER SECTION */}
      <div className="profile-section">
        <div className="section-title">MY <span id="white">PUTTER</span></div>

        <div className="putter-body">
          <img src="/images/malletpro.png" alt="putter" className="putter-img" />

          <div className="putter-info">
            <div className="putter-row">
              <span className="label">Model:</span>
              <span className="value red">MALLET PRO</span>
            </div>
            <div className="putter-row">
              <span className="label">Lie:</span>
              <span className="value">71°</span>
              <span className="label"> Loft:</span>
              <span className="value">3°</span>
              <span className="label"> Offset:</span>
              <span className="value">1/2"</span>
            </div>
            <div className="putter-row">
              <span className="label">Size:</span>
              <span className="value">35"</span>
              <span className="label"> Weight:</span>
              <span className="value red">300G PRO</span>
            </div>
            <div className="putter-row">
              <span className="label">BALANCE SETTING:</span>
              <div className="balance-bar">
                <div className="bar red" />
                <div className="bar red" />
                <div className="bar" />
                <div className="bar" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MY ACHIEVEMENTS SECTION */}
      <div className="profile-section">
        <div className="section-title">MY <span id="white"> ACHIEVEMENTS</span></div>
        <div className="achievements-placeholder">
      
        </div>
      </div>
    </div>
  );
};

export default Profile;
