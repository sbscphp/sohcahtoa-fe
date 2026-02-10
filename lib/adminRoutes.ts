// Base admin route
const admin = () => '/admin';

// Auth routes
const adminLogin = () => `${admin()}/login`;

// Dashboard
const adminDashboard = () => `${admin()}/dashboard`;

// Agent routes
const adminAgent = () => `${admin()}/agent`;
const adminAgentDetails = (id: string | number = ':id') => `${adminAgent()}/${id}`;
const adminAgentTransactions = (id: string | number = ':id') => `${adminAgent()}/transactions/${id}`;

// Customer routes
const adminCustomer = () => `${admin()}/customer`;
const adminCustomerDetails = (id: string | number = ':id') => `${adminCustomer()}/${id}`;

// Rate routes
const adminRate = () => `${admin()}/rate`;
const adminRateCreate = () => `${adminRate()}/create`;
const adminRateDetails = (id: string | number = ':id') => `${adminRate()}/${id}`;

// Transaction routes
const adminTransactions = () => `${admin()}/transactions`;
const adminTransactionDetails = (id: string | number = ':id') => `${adminTransactions()}/${id}`;

// Report routes
const adminReport = () => `${admin()}/report`;

// Audit trail routes
const adminAuditTrail = () => `${admin()}/audit-trial`;

// Ticket routes
const adminTickets = () => `${admin()}/tickets`;
const adminTicketCreate = () => `${adminTickets()}/create`;
const adminTicketDetails = (id: string | number = ':id') => `${adminTickets()}/${id}`;
const adminTicketUpdate = (id: string | number = ':id') => `${adminTickets()}/did/${id}`;

// Outlet routes
const adminOutlet = () => `${admin()}/outlet`;
const adminOutletFranchiseCreate = () => `${adminOutlet()}/franchise/create`;
const adminOutletFranchiseDetails = (id: string | number = ':id') => `${adminOutlet()}/franchise/${id}`;
const adminOutletFranchiseTransactionDetail = (franchiseId: string | number, txId: string) =>
  `${adminOutletFranchiseDetails(franchiseId)}/transactions?tx=${encodeURIComponent(txId)}`;
const adminOutletBranchCreate = () => `${adminOutlet()}/branch/create`;
const adminOutletBranchDetails = (id: string | number = ':id') => `${adminOutlet()}/branch/${id}`;
const adminOutletBranchTransactionDetail = (branchId: string | number, txId: string) =>
  `${adminOutletBranchDetails(branchId)}/transactions?tx=${encodeURIComponent(txId)}`;

// Workflow routes
const adminWorkflow = () => `${admin()}/workflow`;
const adminWorkflowCreate = () => `${adminWorkflow()}/create`;
const adminWorkflowDetails = (id: string | number = ':id') => `${adminWorkflow()}/${id}`;
const adminWorkflowEdit = (id: string | number = ':id') => `${adminWorkflowDetails(id)}/edit`;

//User-Management routes
const adminUserManagement = () => `${admin()}/user-management`;
const adminUserManagementUser = (id: string | number = ':id') => `${adminUserManagement()}/user/${id}`;
const adminUserManagementRole = (id: string | number = ':id') => `${adminUserManagement()}/role/${id}`;

//settings routes
const adminSettings = () => `${admin()}/settings`;



export const adminRoutes = {
  // Base
  admin,
  
  // Auth
  adminLogin,
  
  // Dashboard
  adminDashboard,
  
  // Agents
  adminAgent,
  adminAgentDetails,
  adminAgentTransactions,
  
  // Customers
  adminCustomer,
  adminCustomerDetails,
  
  // Rates
  adminRate,
  adminRateCreate,
  adminRateDetails,
  
  // Transactions
  adminTransactions,
  adminTransactionDetails,
  
  // Reports
  adminReport,
  
  // Audit Trail
  adminAuditTrail,
  
  // Tickets
  adminTickets,
  adminTicketCreate,
  adminTicketDetails,
  adminTicketUpdate,
  
  // Outlet
  adminOutlet,
  adminOutletFranchiseCreate,
  adminOutletFranchiseDetails,
  adminOutletFranchiseTransactionDetail,
  adminOutletBranchCreate,
  adminOutletBranchDetails,
  adminOutletBranchTransactionDetail,
  
  // Workflow
  adminWorkflow,
  adminWorkflowCreate,
  adminWorkflowDetails,
  adminWorkflowEdit,

  // User Management
  adminUserManagement,
  adminUserManagementUser,
  adminUserManagementRole,

  // Settings
  adminSettings,
};
