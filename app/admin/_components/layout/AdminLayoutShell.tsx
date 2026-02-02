'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { getHeaderHeight } from '@/lib/adminBreadcrumbs';

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get page title from route
  const getPageTitle = () => {
    if (pathname === '/admin/dashboard') return 'Dashboard';
    if (pathname?.startsWith('/admin/transactions')) return 'Transactions';
    if (pathname?.startsWith('/admin/settlement')) return 'Settlement';
    if (pathname?.startsWith('/admin/agent')) return 'Agent';
    if (pathname?.startsWith('/admin/outlet')) return 'Outlet';
    if (pathname?.startsWith('/admin/customer')) return 'Customer Management';
    if (pathname?.startsWith('/admin/workflow')) return 'Workflow';
    if (pathname?.startsWith('/admin/tickets')) return 'Tickets';
    if (pathname?.startsWith('/admin/rate')) return 'Rate Management';
    if (pathname?.startsWith('/admin/user-management')) return 'User Management';
    if (pathname?.startsWith('/admin/regulatory')) return 'Regulatory & Compliance';
    if (pathname?.startsWith('/admin/report')) return 'Report and Analytics';
    if (pathname?.startsWith('/admin/audit-trial')) return 'Audit Trail';
    return 'Dashboard';
  };

  // Use useLayoutEffect to check media query on client side before paint to prevent hydration mismatch
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    // This state update is necessary to prevent hydration mismatch between server and client
    // eslint-disable-next-line -- necessary for hydration mismatch prevention
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    if (isMobile) {
      closeMobile();
    }
  }, [isMobile, closeMobile]);

  // Calculate dynamic header height based on current pathname (for breadcrumbs)
  const headerHeight = getHeaderHeight(pathname);

  return (
    <AppShell
      layout={isMobile ? undefined : "alt"}
      header={{ height: headerHeight }}
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
        <Sidebar 
          collapsed={isMobile ? false : collapsed}
          closeMobile={closeMobile}
        />
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
          title={getPageTitle()} 
          setCollapsed={toggleCollapsed}
          toggleMobile={toggleMobile}
        />
      </AppShell.Header>

      <AppShell.Main
        style={{
          backgroundColor: '#F7F7F7',
          minHeight: '100vh',
          padding: '1.5rem',
          marginLeft: isMobile ? 0 : (collapsed ? '80px' : '256px'),
          paddingTop: `calc(${headerHeight}px + 1.5rem)`,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
