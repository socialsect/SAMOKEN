import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import '../Styles/bottomNavbar.css';

const navItems = [
  { 
    to: '/home',
    icon: '/icons/home.svg',
    label: 'HOME',
    exact: true
  },
  { 
    to: '/ai-fit',
    icon: '/icons/search.svg',
    label: 'AI FIT',
    exact: false
  },
  { 
    to: '/settings',
    icon: '/icons/settings.svg',
    label: 'SETTINGS',
    exact: false
  },
  { 
    to: '/training',
    icon: '/icons/TRAIN.svg',   
    label: 'TRAIN',
    exact: false
  },
];

export default function BottomNavbar() {
  const location = useLocation();
  
  // Helper function to check if a nav item is active
  const isActive = (to, exact) => {
    return exact 
      ? location.pathname === to
      : location.pathname.startsWith(to);
  };

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      {navItems.map(({ to, icon, label, exact }, idx) => {
        const active = isActive(to, exact);
        return (
          <NavLink
            key={label}
            to={to}
            className={clsx('item', active && 'active', idx === 0 && 'home')}
            aria-current={active ? 'page' : undefined}
          >
            <img 
              src={icon} 
              alt="" 
              className="icon" 
              style={{fill: active ? '#ffffff' : '#ffffff'}}
              aria-hidden="true"
              width={84}
              height={84}
            />
            <span className="label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
