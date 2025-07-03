import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import '../Styles/bottomNavbar.css';

const navItems = [
  { to: '/home', icon: '/icons/home.svg', label: 'HOME', exact: true },
  { to: '/ai-fit', icon: '/icons/search.svg', label: 'AI FIT' },
  { to: '/settings', icon: '/icons/settings.svg', label: 'SETTINGS' },
  { to: '/training', icon: '/icons/TRAIN.svg', label: 'TRAIN' },
];

export default function BottomNavbar() {
  const location = useLocation();

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

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
            <img src={icon} alt="" className="icon" aria-hidden="true" />
            <span className="label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}