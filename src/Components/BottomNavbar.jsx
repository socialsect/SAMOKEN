import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import "../Styles/bottomNavbar.css";
import { MdOutlineVideoLibrary } from "react-icons/md";

// Multiple sets of navigation items
const navSets = [
  // First set - Main navigation
  [
    {
      to: "/home",
      icon: "/icons/home.svg",
      label: "HOME",
      exact: true,
      id: "i0",
    },
    { to: "/ai-fit", icon: "/AI_FIT_ICON (1).svg", label: "AI FIT", id: "i1" },
    { to: "/set", icon: "/SET_ICON (1).svg", label: "SET", id: "i2" },
    { to: "/training", icon: "/icons/TRAIN.svg", label: "TRAIN", id: "i3" },
  ],
  // Second set - Sample navigation (using existing icons)
  [
    {
      to: "/library",
      icon: <MdOutlineVideoLibrary size={28} />,
      label: "LIBRARY",
      exact: true,
      id: "i3",
    },
    {
      to: "/analytics",
      icon: "/AI_FIT_ICON (1).svg",
      label: "ANALYTICS",
      id: "i5",
    },
    { to: "/targets", icon: "/SET_ICON (1).svg", label: "TARGETS", id: "i6" },
    {
      to: "/achievements",
      icon: "/icons/TRAIN.svg",
      label: "AWARDS",
      id: "i7",
    },
  ],
  // Third set - More sample navigation
  [
    {
      to: "/putting",
      icon: "/icons/home.svg",
      label: "PUTTING",
      exact: true,
      id: "i8",
    },
    { to: "/drills", icon: "/AI_FIT_ICON (1).svg", label: "DRILLS", id: "i9" },
    { to: "/coaching", icon: "/SET_ICON (1).svg", label: "COACH", id: "i10" },
    { to: "/community", icon: "/icons/TRAIN.svg", label: "SOCIAL", id: "i11" },
  ],
];

export default function BottomNavbar() {
  const location = useLocation();
  const [currentSet, setCurrentSet] = useState(0);

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const nextSet = () => {
    setCurrentSet((prev) => (prev + 1) % navSets.length);
  };

  const prevSet = () => {
    setCurrentSet((prev) => (prev - 1 + navSets.length) % navSets.length);
  };

  const currentNavItems = navSets[currentSet];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {/* Left navigation arrow */}
      {currentSet > 0 && (
        <button
          className="nav-arrow nav-arrow-left"
          onClick={prevSet}
          aria-label="Previous navigation set"
        >
          <MdKeyboardArrowLeft />
        </button>
      )}

      {/* Navigation items container */}
      <div className="nav-items-container">
        {currentNavItems.map(({ to, icon, label, exact, id }, idx) => {
          const active = isActive(to, exact);
          return (
            <NavLink
              key={label}
              to={to}
              className={clsx(
                "bottom-nav-item",
                active && "active",
                idx === 0 && "home"
              )}
              id={id}
              aria-current={active ? "page" : undefined}
            >
              {typeof icon === 'string' ? (
                <img src={icon} alt="" className="bottom-nav-icon" aria-hidden="true" />
              ) : (
                <span className="nav-icon">{icon}</span>
              )}
              <span className="bottom-nav-label">{label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Right navigation arrow */}
      <button
        className="nav-arrow nav-arrow-right"
        onClick={nextSet}
        aria-label="Next navigation set"
      >
        <MdKeyboardArrowRight />
      </button>
    </nav>
  );
}
