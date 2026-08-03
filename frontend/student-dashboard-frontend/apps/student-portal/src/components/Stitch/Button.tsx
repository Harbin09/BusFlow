import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  icon,
}) => {
  const baseClasses = 'font-label-md text-label-md rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20',
    secondary: 'bg-white/80 backdrop-blur-xl border border-white/50 text-on-surface-variant hover:bg-white',
    outline: 'border-2 border-outline text-primary hover:bg-surface-container-low',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/50 text-primary hover:shadow-lg',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-body-md',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};
