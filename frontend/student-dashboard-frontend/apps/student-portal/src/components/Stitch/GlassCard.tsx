import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/80 backdrop-blur-xl border border-white/50
      shadow-[0_4px_12px_rgba(37,99,235,0.04)]
      rounded-card hover:shadow-[0_12px_32px_rgba(37,99,235,0.08)]
      hover:translate-y-[-2px] transition-all duration-300
      ${className}
    `}
  >
    {children}
  </div>
);
