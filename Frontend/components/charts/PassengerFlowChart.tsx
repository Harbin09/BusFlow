import React from 'react';
import { Card } from '../ui/Card';

export const PassengerFlowChart: React.FC = () => {
  const hourlyData = [
    { hour: '08:00', count: 120 },
    { hour: '09:00', count: 240 },
    { hour: '10:00', count: 180 },
    { hour: '11:00', count: 90 },
    { hour: '12:00', count: 140 },
    { hour: '13:00', count: 210 },
    { hour: '14:00', count: 160 },
    { hour: '15:00', count: 280 },
  ];

  const maxCount = Math.max(...hourlyData.map((d) => d.count));

  return (
    <Card>
      <h4 className="font-bold text-slate-100 mb-4">Peak Hourly Passenger Volume</h4>
      <div className="flex items-end gap-3 h-44 pt-6 pb-2 px-2 border-b border-slate-800">
        {hourlyData.map((item) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group">
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full bg-blue-600/80 group-hover:bg-blue-500 rounded-t-md transition-all duration-300 relative"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 border border-slate-700 text-[10px] font-bold text-white rounded">
                  {item.count}
                </div>
              </div>
              <span className="text-[10px] text-slate-400">{item.hour}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
