import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopNavBarProps {
  profileImage?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ profileImage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'My Journey', href: '/' },
    { label: 'Live Tracking', href: '/track-bus' },
    { label: 'Schedules', href: '/schedules' },
    { label: 'Stops', href: '/stops' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_12px_rgba(37,99,235,0.04)]">
      <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold text-primary">BusFlow</span>

          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`
                  font-body-md text-body-md transition-colors
                  ${isActive(link.href)
                    ? 'text-primary font-semibold border-b-2 border-primary'
                    : 'text-secondary hover:text-primary'
                  }
                `}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-primary-container/10 transition-colors duration-200 rounded-full active:scale-95">
            <span className="material-symbols-outlined text-secondary">notifications</span>
          </button>
          <button className="p-2 hover:bg-primary-container/10 transition-colors duration-200 rounded-full active:scale-95">
            <span className="material-symbols-outlined text-secondary">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
            <img
              src={profileImage || 'https://via.placeholder.com/40'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
