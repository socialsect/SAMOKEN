import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import '../Styles/bottomNavbar.css';

const navItems = [
  { to: '/home', icon: '/icons/home.svg', label: 'HOME', exact: true,id:'i0' },
  { to: '/ai-fit', icon: '/AI_FIT_ICON (1).svg', label: 'AI FIT',id:'i1' },
  { to: '/set', icon: '/SET_ICON (1).svg', label: 'SET',id:'i2' },
  { to: '/training', icon: '/icons/TRAIN.svg', label: 'TRAIN',id:'i3' },
];

export default function BottomNavbar() {
  const location = useLocation();

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      {navItems.map(({ to, icon, label, exact,id }, idx) => {
        const active = isActive(to, exact);
        return (
          <NavLink
            key={label}
            to={to}
            className={clsx('item', active && 'active', idx === 0 && 'home')}
            id={id}
            aria-current={active ? 'page' : undefined}
          >
            <img src={icon} alt="" className="icon" aria-hidden="true" />
            <span className="label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}