import React from "react";
import "../Styles/page-template.css";
import TopNavbar from "../Components/TopNavbar";
import BottomNavbar from "../Components/BottomNavbar";
const Training = () => {
  return (
    <div className="page-container">
      <TopNavbar />
      <h1>Training</h1>
      <p className="coming-soon">Coming Soon</p>
      <BottomNavbar />
    </div>
  );
};

export default Training;
