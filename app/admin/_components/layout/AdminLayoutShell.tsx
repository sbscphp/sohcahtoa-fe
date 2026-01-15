'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, { toggle: toggleCollapsed, close: closeNavbar }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    if (isMobile) {
      closeNavbar();
    }
  }, [isMobile, closeNavbar]);

  return (
    <AppShell
      layout="alt"
      header={{ height: 64 }}
      navbar={{
        width: collapsed ? 80 : 256,
        breakpoint: 'sm',
        collapsed: { mobile: !collapsed && isMobile },
      }}
      padding="md"
    >
      <AppShell.Navbar>
        <Sidebar collapsed={collapsed} setCollapsed={toggleCollapsed} />
      </AppShell.Navbar>

      <AppShell.Header>
        <Header collapsed={collapsed} title='Dashboard' />
      </AppShell.Header>

      <AppShell.Main
        style={{
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
