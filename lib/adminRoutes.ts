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
};
