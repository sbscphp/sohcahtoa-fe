'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300
          ${collapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <Header collapsed={collapsed} title='Dashboard' />
        <main className="p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
