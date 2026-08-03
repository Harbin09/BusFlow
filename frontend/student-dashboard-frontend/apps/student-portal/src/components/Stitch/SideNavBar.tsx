import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  icon: string;
  href: string;
  label: string;
  fill?: boolean;
}

export const SideNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: 'dashboard', href: '/', label: 'My Journey', fill: true },
    { icon: 'directions_bus', href: '/track-bus', label: 'Live Tracking' },
    { icon: 'schedule', href: '/schedules', label: 'Schedules' },
    { icon: 'location_on', href: '/stops', label: 'Stops' },
    { icon: 'notifications', href: '/notifications', label: 'Notifications' },
    { icon: 'help', href: '/report-issue', label: 'Report Issue' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="hidden lg:flex flex-col gap-unit h-screen w-20 fixed left-0 top-0 pt-24 bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => navigate(item.href)}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-primary text-white shadow-md'
                : 'text-on-surface-variant hover:bg-primary-container/10'
            }`}
            title={item.label}
          >
            <span
              className="material-symbols-outlined"
              style={isActive(item.href) || item.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};
