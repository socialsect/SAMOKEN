import React from 'react';
import { Award, Users, TrendingUp, Globe } from 'lucide-react';
import './About.css';

const About = () => {
  const stats = [
    { icon: Award, value: "15+", label: "Years Experience" },
    { icon: Users, value: "500+", label: "Clients Served" },
    { icon: TrendingUp, value: "98%", label: "Success Rate" },
    { icon: Globe, value: "25+", label: "Countries" }
  ];

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <div className="section-header">
              <h2 className="section-title">About FERZ</h2>
              <p className="section-subtitle">Leading the future of AI governance</p>
            </div>
            
            <div className="about-description">
              <p>
                FERZ is a pioneering force in artificial intelligence governance, specializing in 
                deterministic frameworks that transform probabilistic AI systems into reliable, 
                predictable, and ethically sound solutions.
              </p>
              <p>
                Our mission is to bridge the gap between cutting-edge AI innovation and responsible 
                implementation, ensuring that organizations can harness the full potential of 
                artificial intelligence while maintaining the highest standards of safety, compliance, 
                and ethical responsibility.
              </p>
            </div>

            <div className="about-features">
              <div className="about-feature">
                <div className="feature-bullet"></div>
                <span>Deterministic AI frameworks for predictable outcomes</span>
              </div>
              <div className="about-feature">
                <div className="feature-bullet"></div>
                <span>Comprehensive risk assessment and mitigation</span>
              </div>
              <div className="about-feature">
                <div className="feature-bullet"></div>
                <span>Industry-leading compliance and governance standards</span>
              </div>
            </div>
          </div>

          <div className="about-visual">
            <div className="about-image">
              <div className="image-placeholder">
                <div className="placeholder-content">
                  <Globe size={48} />
                  <span>AI Governance Excellence</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">
                  <stat.icon size={32} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
