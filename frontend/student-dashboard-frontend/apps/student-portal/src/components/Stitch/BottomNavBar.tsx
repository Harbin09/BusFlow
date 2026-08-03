import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: 'dashboard', path: '/' },
    { label: 'Routes', icon: 'directions_bus', path: '/track-bus' },
    { label: 'Wallet', icon: 'account_balance_wallet', path: '/trip-history' },
    { label: 'Profile', icon: 'person', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-white/50 flex justify-around items-center py-4 z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`
            flex flex-col items-center gap-1
            ${isActive(item.path) ? 'text-primary' : 'text-secondary'}
          `}
        >
          <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
