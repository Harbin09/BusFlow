import React from 'react';
import { TopNavBar, SideNavBar, BottomNavBar } from '../../components/Stitch';
import { NotificationHistory } from '../Dashboard/components/NotificationHistory';

export const NotificationsStitch: React.FC = () => {
  return (
    <div className="bg-background min-h-screen text-on-surface">
      <TopNavBar />
      <SideNavBar />
      <BottomNavBar />

      <main className="pt-20 pb-20 pl-0 lg:pl-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <NotificationHistory />
        </div>
      </main>
    </div>
  );
};
