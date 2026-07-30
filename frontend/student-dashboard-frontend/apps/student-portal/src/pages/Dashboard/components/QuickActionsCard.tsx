import React from 'react';
import { NavigateFunction } from 'react-router-dom';

interface QuickActionsCardProps {
  navigate: NavigateFunction;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  navigate,
}) => {
  const actions = [
    {
      id: 'track-bus',
      icon: '📍',
      title: 'Track Bus',
      description: 'Live location of your bus',
      action: () => navigate('/track-bus'),
      color: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      id: 'trip-history',
      icon: '📋',
      title: 'Trip History',
      description: 'Your past journeys',
      action: () => navigate('/trip-history'),
      color: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
    },
    {
      id: 'report-issue',
      icon: '🆘',
      title: 'Report Issue',
      description: 'Submit a complaint',
      action: () => navigate('/report-issue'),
      color: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-200',
    },
    {
      id: 'profile',
      icon: '👤',
      title: 'My Profile',
      description: 'View your details',
      action: () => navigate('/profile'),
      color: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.action}
          className={`${action.color} border ${action.borderColor} rounded-lg p-4 text-left transition-colors`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{action.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm font-semibold text-gray-600">
            Open →
          </div>
        </button>
      ))}
    </div>
  );
};
