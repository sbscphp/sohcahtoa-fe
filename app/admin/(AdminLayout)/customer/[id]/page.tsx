"use client";

import { useState } from "react";
import { Group, Text, Divider } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import TransactionsTable from "../../transactions/_transactionsComponents/TransactionTable";
import { CustomButton } from "@/app/admin/_components/CustomButton";

export type CustomerStatus = "Active" | "Deactivated";

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // Mock customer details – replace with real data when available
  const [status, setStatus] = useState<CustomerStatus>("Active");
  const customerName = "Alao Adeola";
  const customerId = params?.id ?? "677333";

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Track which action the user is taking so copy can adapt
  const isCurrentlyActive = status === "Active";
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";

  const handleToggleClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setStatus((prev) => (prev === "Active" ? "Deactivated" : "Active"));
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
  };

  const handleViewAllCustomers = () => {
    router.push("/admin/customer");
  };

  return (
    <div className="space-y-6">
      {/* Customer header card */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Text size="xl" fw={600}>
                {customerName}
              </Text>

              <Group gap={8} className="flex-wrap text-sm text-[#6B7280]">
                <span>
                  Date Joined: Nov 10 2025 | 11:00am
                </span>
                <StatusBadge status={status} />
              </Group>
            </div>

            <CustomButton
              buttonType={isCurrentlyActive ? "secondary" : "primary"}
              onClick={handleToggleClick}
            >
              {isCurrentlyActive ? "Deactivate Customer" : "Reactivate Customer"}
            </CustomButton>
          </div>

          <Divider className="my-2" />

          {/* Customer detail grid */}
          <section className="space-y-4">
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem label="Customer ID" value={customerId.toString()} />
              <DetailItem label="Email Address" value="adekunle@sohcahtoa.com" />
              <DetailItem label="Phone Number" value="+234 90 4747 2791" />
              <DetailItem label="Number of Transaction" value="20" />
              <DetailItem label="Transaction Volume" value="20" />
              <DetailItem label="Last Active" value="November 17 2025" />
            </div>
          </section>
        </div>
      </div>

      {/* Transactions table */}
      
      <TransactionsTable />

      {/* Deactivate / Reactivate confirmation modal */}
      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`${actionVerb} Customer ?`}
        message={`Are you sure, ${actionVerb.toLowerCase()} this customer profile? Kindly note that this action implies the customer will ${
          isCurrentlyActive
            ? "no longer be able to access both the mobile app and web app."
            : "again be able to access both the mobile app and web app."
        }`}
        primaryButtonText={`Yes, ${actionVerb} Customer`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={`Customer ${pastTenseVerb}`}
        message={`Customer profile has been successfully ${pastTenseVerb.toLowerCase()}.`}
        primaryButtonText="View All Customer"
        onPrimaryClick={handleViewAllCustomers}
        secondaryButtonText="No, Close"
      />
    </div>
  );
}