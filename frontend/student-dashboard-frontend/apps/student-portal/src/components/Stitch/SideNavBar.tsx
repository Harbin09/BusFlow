import React from 'react';

export const SideNavBar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col gap-unit h-screen w-20 fixed left-0 top-0 pt-24 bg-white/80 backdrop-blur-xl border-r border-white/50 z-40">
      <div className="flex flex-col items-center gap-6">
        <div className="p-3 bg-primary-container/20 text-primary rounded-xl cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
        </div>
        <div className="p-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl cursor-pointer transition-all">
          <span className="material-symbols-outlined">directions_bus</span>
        </div>
        <div className="p-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl cursor-pointer transition-all">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div className="p-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl cursor-pointer transition-all">
          <span className="material-symbols-outlined">contact_support</span>
        </div>
      </div>
    </aside>
  );
};
