"use client";

/**
 * Agent flows use customer bank-account endpoints for now.
 * Swap to agent-specific routes in agent-api when the backend provides them.
 */
export { useCustomerBankAccounts as useAgentBankAccounts } from "@/app/(customer)/_hooks/use-customer-bank-accounts";
