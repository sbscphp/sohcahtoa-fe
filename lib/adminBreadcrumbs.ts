import { adminRoutes } from './adminRoutes';

export type Breadcrumb = {
  label: string;
  url?: string;
};

// Header height constants
export const BASE_HEADER_HEIGHT = 64; // h-16 = 64px
export const BREADCRUMB_HEIGHT = 48; // py-3 + text content ~48px
export const DYNAMIC_CONTENT_HEIGHT = 40; // Estimated height for dynamic header content

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
    '/admin/tickets',
    '/admin/workflow',
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

  // Franchise Transaction Detail: /admin/outlet/franchise/:id/transactions
  if (/^\/admin\/outlet\/franchise\/[^/]+\/transactions$/.test(pathname)) {
    const franchiseId = pathname.split('/')[4];
    return [
      { label: 'Outlet', url: adminRoutes.adminOutlet() },
      { label: 'Franchise Details', url: adminRoutes.adminOutletFranchiseDetails(franchiseId) },
      { label: 'Transaction Details' },
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

  // Branch Transaction Detail: /admin/outlet/branch/:id/transactions
  if (/^\/admin\/outlet\/branch\/[^/]+\/transactions$/.test(pathname)) {
    const branchId = pathname.split('/')[4];
    return [
      { label: 'Outlet', url: adminRoutes.adminOutlet() },
      { label: 'Branch Details', url: adminRoutes.adminOutletBranchDetails(branchId) },
      { label: 'Transaction Details' },
    ];
  }

  // Ticket Create: /admin/tickets/create
  if (pathname === '/admin/tickets/create') {
    return [
      { label: 'Ticket Management', url: adminRoutes.adminTickets() },
      { label: 'Create Incident' },
    ];
  }

  // Ticket Update: /admin/tickets/did/:id
  const ticketDidMatch = pathname.match(/^\/admin\/tickets\/did\/([^/]+)$/);
  if (ticketDidMatch) {
    const ticketId = ticketDidMatch[1];
    return [
      { label: 'Ticket Management', url: adminRoutes.adminTickets() },
      { label: 'Ticket Details', url: adminRoutes.adminTicketDetails(ticketId) },
      { label: 'Update Incident' },
    ];
  }

  // Ticket Details: /admin/tickets/:id
  if (/^\/admin\/tickets\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Ticket Management', url: adminRoutes.adminTickets() },
      { label: 'Ticket Details' },
    ];
  } 

  // Ticket Details: /admin/user-management/user/:id
  if (/^\/admin\/user-management\/user\/[^/]+$/.test(pathname)) {
    return [
      { label: 'User Management', url: adminRoutes.adminUserManagement() },
      { label: 'User Details' },
    ];
  } 
  // Ticket Details: /admin/user-management/role/:id
  if (/^\/admin\/user-management\/role\/[^/]+$/.test(pathname)) {
    return [
      { label: 'User Management', url: adminRoutes.adminUserManagement() },
      { label: 'Role Details' },
    ];
  } 

  // Workflow Create: /admin/workflow/create
  if (pathname === '/admin/workflow/create') {
    return [
      { label: 'Workflow', url: adminRoutes.adminWorkflow() },
      { label: 'Create Workflow' },
    ];
  }

  // Workflow Edit: /admin/workflow/:id/edit
  if (/^\/admin\/workflow\/[^/]+\/edit$/.test(pathname)) {
    const workflowId = pathname.split('/')[3];
    return [
      { label: 'Workflow', url: adminRoutes.adminWorkflow() },
      { label: 'Workflow Details', url: adminRoutes.adminWorkflowDetails(workflowId) },
      { label: 'Edit Workflow' },
    ];
  }

  // Workflow Details: /admin/workflow/:id
  if (/^\/admin\/workflow\/[^/]+$/.test(pathname)) {
    return [
      { label: 'Workflow', url: adminRoutes.adminWorkflow() },
      { label: 'Workflow Details' },
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
