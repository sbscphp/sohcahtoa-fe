// Base admin route
const admin = () => '/admin';

// Auth routes
const adminLogin = () => `${admin()}/login`;
const adminResetPassword = () => `${admin()}/reset-password`;

// Dashboard
const adminDashboard = () => `${admin()}/dashboard`;

// Agent routes
const adminAgent = () => `${admin()}/agent`;
const adminAgentDetails = (id: string | number = ':id') => `${adminAgent()}/${id}`;
const adminAgentTransactions = (id: string | number = ':id') =>
  `${adminAgent()}/transactions/${id}`;
const adminAgentTransactionDetails = (
  agentId: string | number = ':agentId',
  transactionId: string | number = ':transactionId'
) => `${adminAgent()}/${agentId}/transactions/${transactionId}`;

// Customer routes
const adminCustomer = () => `${admin()}/customer`;
const adminCustomerDetails = (id: string | number = ':id') => `${adminCustomer()}/${id}`;

// Rate routes
const adminRate = () => `${admin()}/rate`;
const adminRateCreate = () => `${adminRate()}/create`;
const adminRateDetails = (id: string | number = ':id') => `${adminRate()}/${id}`;

// Transaction routes
const adminTransactions = () => `${admin()}/transactions`;
const adminTransactionsWorkflows = () =>
  `${adminTransactions()}?tab=transaction-workflows`;
const adminTransactionDetails = (id: string | number = ':id') => `${adminTransactions()}/${id}`;

// Report routes
const adminReport = () => `${admin()}/report`;

// Audit trail routes
const adminAuditTrail = () => `${admin()}/audit-trail`;

// Ticket routes
const adminTickets = () => `${admin()}/tickets`;
const adminTicketCreate = () => `${adminTickets()}/create`;
const adminTicketDetails = (id: string | number = ':id') => `${adminTickets()}/${id}`;
const adminTicketUpdate = (id: string | number = ':id') => `${adminTickets()}/edit/${id}`;

// Outlet routes
const adminOutlet = () => `${admin()}/outlet`;
const adminOutletFranchiseCreate = () => `${adminOutlet()}/franchise/create`;
const adminOutletFranchiseDetails = (id: string | number = ':id') => `${adminOutlet()}/franchise/${id}`;
const adminOutletFranchiseTransactionDetail = (franchiseId: string | number, txId: string) =>
  `${adminOutletFranchiseDetails(franchiseId)}/transactions?tx=${encodeURIComponent(txId)}`;
const adminOutletBranchCreate = () => `${adminOutlet()}/branch/create`;
const adminOutletBranchDetails = (id: string | number = ':id') => `${adminOutlet()}/branch/${id}`;
const adminOutletBranchEditDetails = (id: string | number = ':id') => `${adminOutletBranchDetails(id)}/edit`;
const adminOutletBranchTransactionDetail = (branchId: string | number, txId: string) =>
  `${adminOutletBranchDetails(branchId)}/transactions/${encodeURIComponent(txId)}`;

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
const adminSettingsPassword = () => `${adminSettings()}?tab=password`;
const adminSettingsAccountInformation = () => `${adminSettings()}?tab=account`;
const adminSettingsNotifications = () => `${adminSettings()}?tab=notifications`;
const adminSettingsPickupStations = () => `${adminSettings()}?tab=pickup-stations`;
const adminSettingsPickupStationDetails = (
  id: string | number = ':id'
) => `${adminSettings()}/pickup-stations/${id}`;
const adminSettingsRates = () => `${adminSettings()}?tab=rates`;
const adminSettingsRateCreate = () => `${adminSettings()}/rate/create`;
const adminSettingsRateDetails = (id: string | number = ':id') => `${adminSettings()}/rate/${id}`;
const adminSettingsWorkflowConfiguration = () => `${adminSettings()}?tab=workflow-configuration`;
const adminSettingsWorkflowCreate = () => `${adminSettings()}/workflow/create`;
const adminSettingsWorkflowDetails = (id: string | number = ':id') =>
  `${adminSettings()}/workflow/${id}`;
const adminSettingsWorkflowEdit = (id: string | number = ':id') =>
  `${adminSettingsWorkflowDetails(id)}/edit`;

//settlement routes
const adminSettlement = () => `${admin()}/settlement`;
const adminSettlementRegisterEscrow = () => `${adminSettlement()}/register-escrow`;

// Transient wallet routes
const adminTransientWallets = () => `${admin()}/transient-wallets`;
const adminTransientWalletDetails = (walletId: string | number = ':walletId') =>
  `${adminTransientWallets()}/${walletId}`;
const adminTransientWalletEntryDetails = (
  walletId: string | number = ':walletId',
  entryId: string | number = ':entryId'
) => `${adminTransientWalletDetails(walletId)}/entries/${entryId}`;


export const adminRoutes = {
  // Base
  admin,
  
  // Auth
  adminLogin,
  adminResetPassword,
  
  // Dashboard
  adminDashboard,
  
  // Agents
  adminAgent,
  adminAgentDetails,
  adminAgentTransactions,
  adminAgentTransactionDetails,
  
  // Customers
  adminCustomer,
  adminCustomerDetails,
  
  // Rates
  adminRate,
  adminRateCreate,
  adminRateDetails,
  
  // Transactions
  adminTransactions,
  adminTransactionsWorkflows,
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
  adminOutletBranchEditDetails,
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
  adminSettingsPickupStations,
  adminSettingsPickupStationDetails,
  adminSettingsPassword,
  adminSettingsAccountInformation,
  adminSettingsNotifications,
  adminSettingsRates,
  adminSettingsRateCreate,
  adminSettingsRateDetails,
  adminSettingsWorkflowConfiguration,
  adminSettingsWorkflowCreate,
  adminSettingsWorkflowDetails,
  adminSettingsWorkflowEdit,

  // Settlement
  adminSettlement,
  adminSettlementRegisterEscrow,

  // Transient Wallets
  adminTransientWallets,
  adminTransientWalletDetails,
  adminTransientWalletEntryDetails,
};
