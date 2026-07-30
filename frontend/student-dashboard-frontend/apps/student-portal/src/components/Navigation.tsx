import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentApi } from '../services/api/studentApi';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    studentApi.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1 className="brand-title">🚌 BusFlow</h1>
          <p className="brand-subtitle">Student Dashboard</p>
        </div>

        <ul className="nav-menu">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              📊 Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/track-bus');
              }}
              className={`nav-link ${isActive('/track-bus') ? 'active' : ''}`}
            >
              📍 Track Bus
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/trip-history');
              }}
              className={`nav-link ${isActive('/trip-history') ? 'active' : ''}`}
            >
              📋 Trip History
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/report-issue');
              }}
              className={`nav-link ${isActive('/report-issue') ? 'active' : ''}`}
            >
              🆘 Report Issue
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/profile');
              }}
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              👤 My Profile
            </a>
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};
