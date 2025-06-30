import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/topNavbar.css';
import { IoCloseOutline } from "react-icons/io5";

const TopNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="top-navbar">
        <button className="menu-button" onClick={toggleMenu} aria-label="Toggle menu">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.375 8.75C4.02982 8.75 3.75 8.47018 3.75 8.125C3.75 7.77982 4.02982 7.5 4.375 7.5H21.875C22.2202 7.5 22.5 7.77982 22.5 8.125C22.5 8.47018 22.2202 8.75 21.875 8.75H4.375ZM4.375 15C4.02982 15 3.75 14.7202 3.75 14.375C3.75 14.0298 4.02982 13.75 4.375 13.75H25.625C25.9702 13.75 26.25 14.0298 26.25 14.375C26.25 14.7202 25.9702 15 25.625 15H4.375ZM4.375 21.25C4.02982 21.25 3.75 20.9702 3.75 20.625C3.75 20.2798 4.02982 20 4.375 20H13.125C13.4702 20 13.75 20.2798 13.75 20.625C13.75 20.9702 13.4702 21.25 13.125 21.25H4.375Z" fill="white"/>
          </svg>
        </button>
        
        <Link to="/" className="logo-container">
          <img
            src="/Logos/THE RUNNER-LOGOS-02.svg"
            alt="Runner Logo"
            className="logo"  
            width={280}
            height="auto"
          />
        </Link>
        
        <div className="profile-container">
          <img 
            src="/icons/profile-placeholder.svg" 
            alt="Profile" 
            className="profile-image"
          />
        </div>
      </nav>

      {/* Full-screen Menu */}
      <div className={`fullscreen-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <button className="close-button" onClick={toggleMenu}>
            <IoCloseOutline size={30} />
          </button>
          <nav className="menu-nav">
            <Link to="/home" className="menu-item" onClick={toggleMenu}>Home</Link>
            <Link to="/training" className="menu-item" onClick={toggleMenu}>Train</Link>
            <Link to="/ai-fit" className="menu-item" onClick={toggleMenu}>AI Fit</Link>
            <Link to="/settings" className="menu-item" onClick={toggleMenu}>Settings</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default TopNavbar;
