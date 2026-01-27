"use client";

import { Drawer, Tabs } from "@mantine/core";
import { EmptyState } from "@/app/(customer)/_components/common";
import { underReview } from "@/app/assets/asset";
import type { DetailViewStatus } from "@/app/(customer)/_lib/transaction-details";

interface TransactionRequestSheetProps {
  opened: boolean;
  onClose: () => void;
  viewStatus: DetailViewStatus;
}

export default function TransactionRequestSheet({
  opened,
  onClose,
  viewStatus,
}: TransactionRequestSheetProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="full"
      withCloseButton={false}
      overlayProps={{ opacity: 0.55, blur: 2 }}
      classNames={{
        body: "bg-white w-full md:w-[520px]",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#F2F4F7]">
        <div>
          <h2 className="text-[#131212] font-semibold text-xl leading-7">
            Transaction Request
          </h2>
          <p className="text-[#6C6969] text-sm leading-5 mt-0.5">
            Track and manage your transaction request
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-md hover:bg-gray-100 text-[#6C6969] transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        
      >
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="documentation">Documentation</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          {viewStatus === "under_review" && (
            <EmptyState
              imageSrc={underReview}
              title="Application is Under Review."
              description="Your document is currently undergoing approval. You will receive a mail notification once your documents is approved."
            />
          )}
          {viewStatus === "awaiting_disbursement" && (
            <div className="py-6">
              <p className="text-[#6C6969] text-sm">Awaiting disbursement content (placeholder).</p>
            </div>
          )}
          {viewStatus === "transaction_settled" && (
            <div className="py-6">
              <p className="text-[#6C6969] text-sm">Transaction settled – no pending updates.</p>
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="documentation">
          <div className="py-6">
            <p className="text-[#6C6969] text-sm">Documentation tab (document list placeholder).</p>
          </div>
        </Tabs.Panel>
      </Tabs>
    </Drawer>
  );
}
