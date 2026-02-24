"use client";

import { CustomerStatCards } from "./_components/CustomerStatCards";
import CustomerTable from "./_components/CustomerTable";

export default function CustomerManagementPage() {
  // Mock data - replace with actual API call
  const stats = {
    totalCustomers: 178,
    verifiedCustomers: 106,
    repeatCustomers: 85,
    pendingKYC: 22,
  };

  return (
    <div className="space-y-6">
      <CustomerStatCards {...stats} />
      <CustomerTable />
    </div>
  );
}
