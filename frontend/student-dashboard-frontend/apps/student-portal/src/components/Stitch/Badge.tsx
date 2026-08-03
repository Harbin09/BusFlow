import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'secondary';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '', icon }) => {
  const variantClasses = {
    primary: 'bg-primary-fixed text-on-primary-fixed',
    success: 'bg-green-100 text-green-800',
    error: 'bg-error-container text-on-error-container',
    warning: 'bg-yellow-100 text-yellow-800',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        rounded-full
        font-label-md text-label-md
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
};
