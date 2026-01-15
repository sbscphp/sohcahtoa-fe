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
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    if (isMobile) {
      closeMobile();
    }
  }, [isMobile, closeMobile]);

  return (
    <AppShell
      layout={isMobile ? undefined : "alt"}
      header={{ height: 64 }}
      navbar={{
        width: isMobile ? 256 : (collapsed ? 80 : 256),
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
      style={{
        minHeight: '100vh',
      }}
    >
      <AppShell.Navbar>
        <Sidebar collapsed={isMobile ? false : collapsed} />
      </AppShell.Navbar>

      <AppShell.Header
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? '80px' : '256px'),
          transition: 'margin-left 0.3s ease',
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 200,
        }}
      >
        <Header 
          collapsed={collapsed} 
          title='Dashboard' 
          setCollapsed={toggleCollapsed}
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
        />
      </AppShell.Header>

      <AppShell.Main
        style={{
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 64px)',
          padding: '1rem',
          marginLeft: isMobile ? 0 : (collapsed ? '80px' : '256px'),
          paddingTop: 'calc(64px + 1rem)',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
