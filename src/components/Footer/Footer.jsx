import React from 'react';
import { Link } from 'react-router-dom';
import DarkVeil from '../DarkVeil/darkveil';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Animated Background */}
      <div className="footer-background">
        <DarkVeil 
          intensity={0.4}
          speed={0.6}
          glowIntensity={0.12}
          patternOpacity={0.025}
        />
        <div className="footer-glow"></div>
        <div className="footer-pattern"></div>
      </div>
      
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-section company-info">
            <div className="footer-logo">
              <img src="/FERZWHITELETTERS.svg" alt="FERZ" />
            </div>
            <p className="company-description">
              Leading the future of AI governance with innovative frameworks, 
              strategic insights, and transformative solutions that drive 
              sustainable technological advancement.
            </p>
            <div className="social-links">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li><Link to="/ai-governance" className="footer-link">AI Governance</Link></li>
              <li><Link to="/risk-assessment" className="footer-link">Risk Assessment</Link></li>
              <li><Link to="/compliance-frameworks" className="footer-link">Compliance Frameworks</Link></li>
              <li><Link to="/strategic-advisory" className="footer-link">Strategic Advisory</Link></li>
              <li><Link to="/implementation-support" className="footer-link">Implementation Support</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="footer-section">
            <h3 className="footer-title">Solutions</h3>
            <ul className="footer-links">
              <li><Link to="/enterprise-ai" className="footer-link">Enterprise AI</Link></li>
              <li><Link to="/financial-services" className="footer-link">Financial Services</Link></li>
              <li><Link to="/healthcare-ai" className="footer-link">Healthcare AI</Link></li>
              <li><Link to="/automotive-ai" className="footer-link">Automotive AI</Link></li>
              <li><Link to="/retail-ai" className="footer-link">Retail AI</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/team" className="footer-link">Our Team</Link></li>
              <li><Link to="/careers" className="footer-link">Careers</Link></li>
              <li><Link to="/news" className="footer-link">News & Insights</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h3 className="footer-title">Resources</h3>
            <ul className="footer-links">
              <li><Link to="/whitepapers" className="footer-link">Whitepapers</Link></li>
              <li><Link to="/case-studies" className="footer-link">Case Studies</Link></li>
              <li><Link to="/webinars" className="footer-link">Webinars</Link></li>
              <li><Link to="/blog" className="footer-link">Blog</Link></li>
              <li><Link to="/research" className="footer-link">Research</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-legal">
              <p>&copy; {currentYear} FERZ. All rights reserved.</p>
              <div className="legal-links">
                <Link to="/privacy" className="legal-link">Privacy Policy</Link>
                <Link to="/terms" className="legal-link">Terms of Service</Link>
                <Link to="/cookies" className="legal-link">Cookie Policy</Link>
              </div>
            </div>
            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Get the latest insights on AI governance</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
