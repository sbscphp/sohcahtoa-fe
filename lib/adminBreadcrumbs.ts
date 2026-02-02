import { adminRoutes } from './adminRoutes';

export type Breadcrumb = {
  label: string;
  url?: string;
};

// Header height constants
export const BASE_HEADER_HEIGHT = 64; // h-16 = 64px
export const BREADCRUMB_HEIGHT = 48; // py-3 + text content ~48px
export const DYNAMIC_CONTENT_HEIGHT = 48; // Estimated height for dynamic header content

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
    '/admin/outlet',
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

  // Franchise Create: /admin/outlet/franchise/create
  if (pathname === '/admin/outlet/franchise/create') {
    return [
      { label: 'Outlet', url: adminRoutes.adminOutlet() },
      { label: 'Create Franchise' },
    ];
  }

  // Franchise Details: /admin/outlet/franchise/:id
  if (/^\/admin\/outlet\/franchise\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Outlet', url: adminRoutes.adminOutlet() },
      { label: 'Franchise Details' },
    ];
  }

  // Branch Create: /admin/outlet/branch/create
  if (pathname === '/admin/outlet/branch/create') {
    return [
      { label: 'Outlet', url: adminRoutes.adminOutlet() },
      { label: 'Create Branch' },
    ];
  }

  // Branch Details: /admin/outlet/branch/:id
  if (/^\/admin\/outlet\/branch\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Outlet', url: adminRoutes.adminOutlet() },
      { label: 'Branch Details' },
    ];
  }

  // Default: no breadcrumbs
  return [];
}

/**
 * Calculate total header height based on breadcrumbs and dynamic content
 */
export function getHeaderHeight(pathname: string, hasDynamicContent: boolean = false): number {
  const breadcrumbs = getBreadcrumbs(pathname);
  let height = BASE_HEADER_HEIGHT;
  
  if (breadcrumbs.length > 0) {
    height += BREADCRUMB_HEIGHT;
  }
  
  if (hasDynamicContent) {
    height += DYNAMIC_CONTENT_HEIGHT;
  }
  
  return height;
}
