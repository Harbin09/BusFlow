import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BusFlow - Smart Campus Bus Tracking & Fleet Management',
  description: 'Enterprise Real-Time GPS Telemetry and Campus Bus Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
