'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import CustomerHeader from './CustomerHeader';
import CustomerSidebar from './CustomerSidebar';
import {
  getTransactionBreadcrumbs,
  getChooseOptionsBreadcrumbs,
  getTransactionTypeLabel,
  type TransactionType,
  type TransactionStep,
} from '@/app/(customer)/_utils/transaction-flow';

const HEADER_HEIGHT = 64;

// Type mapping from URL params to TransactionType
const TYPE_MAP: Record<string, TransactionType> = {
  vacation: "pta",
  business: "business",
  "school-fees": "school-fees",
  medical: "medical",
  "professional-body": "professional-body",
  tourist: "tourist",
  resident: "resident",
  "touring-nigeria": "touring-nigeria",
  expatriate: "expatriate",
};

export default function CustomerLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a transaction creation page (buy: /transactions/vacation, sell: /transactions/sell/resident)
  const isSellFlow = pathname?.startsWith('/transactions/sell/');
  const isReceiveImtoFlow = pathname?.startsWith('/transactions/receive/imto');
  const isTransactionPage = pathname?.startsWith('/transactions/') && params?.type;
  const isChooseOptionsPage = pathname?.startsWith('/transactions/new/');
  const urlType = params?.type as string | undefined;
  const transactionType = urlType ? (TYPE_MAP[urlType] || "pta") : null;

  const isSupportChatPage = pathname === '/support/chat';
  const isSupportHistoryPage = pathname === '/support/history';
  const isSupportViewPage = pathname?.startsWith('/support/history/') && pathname !== '/support/history';
  const isSupportPage = pathname?.startsWith('/support');
  const isSettingsPage = pathname?.startsWith('/settings');
  const isNotificationsPage = pathname === '/notifications';

  // Get page title from route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/transactions') return 'Transactions';
    if (pathname?.startsWith('/transactions/new')) return 'New Transaction';
    if (pathname?.startsWith('/rate-calculator')) return 'Rate Calculator';
    if (pathname === '/settings') return 'Setting';
    if (pathname === '/settings/account-information') return 'Setting: Account Information';
    if (pathname === '/settings/change-password') return 'Setting: Change Password';
    if (isNotificationsPage) return 'Notification';
    if (isSupportChatPage) return 'Support: Chat Support';
    if (isSupportHistoryPage) return 'Support: Support History';
    if (isSupportViewPage) return 'Support: View Support';
    if (pathname === '/support') return 'Support';
    if (isReceiveImtoFlow) return 'Receive Money: IMTO';
    if (isTransactionPage && transactionType) {
      return isSellFlow
        ? `Sell FX: ${getTransactionTypeLabel(transactionType)}`
        : `Buy FX: ${getTransactionTypeLabel(transactionType)}`;
    }
    return 'Dashboard';
  };

  // Get breadcrumbs for transaction pages
  const getBreadcrumbs = () => {
    if (isSupportChatPage) {
      return [
        { label: 'Support', href: '/support' },
        { label: 'Chat Support', href: undefined },
      ];
    }
    if (isSupportHistoryPage) {
      return [
        { label: 'Support', href: '/support' },
        { label: 'Support History', href: undefined },
      ];
    }
    if (isSupportViewPage) {
      return [
        { label: 'Support', href: '/support' },
        { label: 'Support History', href: '/support/history' },
        { label: 'View', href: undefined },
      ];
    }
    if (pathname === '/settings/account-information') {
      return [
        { label: 'Setting', href: '/settings' },
        { label: 'Account Information', href: undefined },
      ];
    }
    if (pathname === '/settings/change-password') {
      return [
        { label: 'Setting', href: '/settings' },
        { label: 'Change Password', href: undefined },
      ];
    }
    if (pathname === '/settings') {
      return [{ label: 'Setting', href: undefined }];
    }
    if (isNotificationsPage) {
      return [
        { label: 'My Profile', href: '#' },
        { label: 'Notification', href: undefined },
      ];
    }
    if (isChooseOptionsPage) {
      return getChooseOptionsBreadcrumbs();
    }
    if (isReceiveImtoFlow) {
      return [
        { label: 'Transactions', href: '/transactions' },
        { label: 'Choose an Option', href: '/transactions/options' },
      ];
    }
    if (!isTransactionPage || !transactionType) return undefined;
    const stepMatch = pathname?.match(/\/(upload-documents|amount|pickup-point|bank-details)/);
    const currentStep: TransactionStep = (stepMatch?.[1] as TransactionStep) || "upload-documents";
    const pathPrefix = isSellFlow ? "transactions/sell" : "transactions";
    return getTransactionBreadcrumbs(transactionType, currentStep, pathPrefix);
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

  return (
    <AppShell
      layout={isMobile ? undefined : "alt"}
      header={{ height: HEADER_HEIGHT }}
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
<CustomerSidebar
          collapsed={isMobile ? false : collapsed}
          onCollapse={toggleCollapsed}
          onNavigate={closeMobile}
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
        <CustomerHeader 
          collapsed={collapsed} 
          title={(isTransactionPage || isChooseOptionsPage || isReceiveImtoFlow || isSupportPage || isSettingsPage || isNotificationsPage) ? undefined : getPageTitle()} 
          setCollapsed={toggleCollapsed}
          toggleMobile={toggleMobile}
          breadcrumbs={getBreadcrumbs()}
          transactionTitle={(isTransactionPage || isChooseOptionsPage || isReceiveImtoFlow || isSupportPage || isSettingsPage || isNotificationsPage) ? getPageTitle() : undefined}
        />
      </AppShell.Header>

      <AppShell.Main
        style={{
          backgroundColor: '#F7F7F7',
          minHeight: '100vh',
          padding: '1.5rem',
          marginLeft: isMobile ? 0 : (collapsed ? '80px' : '256px'),
          paddingTop: `calc(${HEADER_HEIGHT}px + 1.5rem)`,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
