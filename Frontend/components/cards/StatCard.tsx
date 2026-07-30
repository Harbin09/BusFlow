import React from 'react';
import { Card } from '../ui/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendPositive = true }) => {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100 mt-1">{value}</h3>
        {trend && (
          <span className={`text-xs font-medium mt-1 inline-block ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
        {icon}
      </div>
    </Card>
  );
};
