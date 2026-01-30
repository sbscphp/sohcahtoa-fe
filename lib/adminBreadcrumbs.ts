import { adminRoutes } from './adminRoutes';

export type Breadcrumb = {
  label: string;
  url?: string;
};

/**
 * Generate breadcrumbs for admin routes based on the current pathname
 * Base routes (e.g., /admin/dashboard, /admin/transactions) return empty array
 * Detail/child routes return breadcrumb hierarchy
 */
export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  // Base routes - no breadcrumbs
  const baseRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/transactions',
    '/admin/agent',
    '/admin/customer',
    '/admin/rate',
    '/admin/report',
    '/admin/audit-trial',
    '/admin/login',
  ];

  if (baseRoutes.includes(pathname)) {
    return [];
  }

  // Transaction Details: /admin/transactions/:id
  if (/^\/admin\/transactions\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Transactions', url: adminRoutes.adminTransactions() },
      { label: 'Transaction Details' },
    ];
  }

  // Agent Details: /admin/agent/:id
  if (/^\/admin\/agent\/[^/]+$/.test(pathname) && !pathname.includes('/transactions')) {
    return [
      { label: 'Agents', url: adminRoutes.adminAgent() },
      { label: 'Agent Details' },
    ];
  }

  // Agent Transactions: /admin/agent/transactions/:id
  if (/^\/admin\/agent\/transactions\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Agents', url: adminRoutes.adminAgent() },
      { label: 'Agent Transactions' },
    ];
  }

  // Customer Details: /admin/customer/:id
  if (/^\/admin\/customer\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Customers', url: adminRoutes.adminCustomer() },
      { label: 'Customer Details' },
    ];
  }

  // Rate Create: /admin/rate/create
  if (pathname === '/admin/rate/create') {
    return [
      { label: 'Rate', url: adminRoutes.adminRate() },
      { label: 'Add New Rate' },
    ];
  }

  // Rate Details: /admin/rate/:id
  if (/^\/admin\/rate\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Rate', url: adminRoutes.adminRate() },
      { label: 'Rate Details' },
    ];
  }

  // Default: no breadcrumbs
  return [];
}
