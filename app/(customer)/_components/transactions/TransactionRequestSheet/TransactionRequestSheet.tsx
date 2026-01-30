"use client";

import { Drawer, Tabs } from "@mantine/core";
import OverviewDetail from "./OverviewDetail";
import DocumentDetail, { type TransactionDocumentItem } from "./DocumentDetail";
import type { DetailViewStatus } from "@/app/(customer)/_lib/transaction-details";

interface TransactionRequestSheetProps {
  opened: boolean;
  onClose: () => void;
  viewStatus: DetailViewStatus;
  /** Transaction type label (e.g. "BTA", "Personal Travel Allowance (PTA)") – used in resubmit success modal title */
  transactionTypeLabel?: string;
  transactionId?: string;
  date?: string;
  time?: string;
  adminMessage?: string;
  onProceedToPayment?: () => void;
  /** Documents for Documentation tab (name, size, status, re-upload). */
  documents?: TransactionDocumentItem[];
  /** Called when user clicks "View Transaction" in resubmit success modal (e.g. close sheet). */
  onViewTransaction?: () => void;
}

export default function TransactionRequestSheet({
  opened,
  onClose,
  viewStatus,
  transactionTypeLabel,
  transactionId,
  date,
  time,
  adminMessage,
  onProceedToPayment,
  documents,
  onViewTransaction,
}: TransactionRequestSheetProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={600}
      withCloseButton={false}
      classNames={{
        content: "border-l border-gray-100",
      }}
      overlayProps={{ opacity: 0.55, blur: 2 }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: 0,
        },
      }}
    >
      {/* Header - Sidebar: padding 40px 16px 0, gap 16px */}
      <div className="flex flex-col gap-4 pt-10 px-4">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <h2 className="text-[#4D4B4B] font-bold text-lg leading-[26px]">
              Transaction Request
            </h2>
            <p className="text-[#8F8B8B] font-normal text-sm leading-5">
              Track and manage your transaction request
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-[#8F8B8B] hover:bg-gray-100 transition-colors border border-[#8F8B8B]"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Horizontal tabs: divider bottom 1px #EAECF0; active #DD4F05, 2px bottom; inactive #8F8B8B; 14px medium */}
        <Tabs
          defaultValue="overview"
          classNames={{
            root: "flex flex-col flex-1 min-h-0",
            list: "border-b border-[#EAECF0] gap-4",
            tab: "font-medium text-sm leading-5 data-[active]:text-[#DD4F05] data-[active]:border-b-2 data-[active]:border-[#DD4F05] data-[active]:-mb-px pb-4 data-[inactive]:text-[#8F8B8B]",
            panel: "flex-1 overflow-y-auto min-h-0",
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="documentation">Documentation</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <OverviewDetail
              viewStatus={viewStatus}
              transactionId={transactionId}
              date={date}
              time={time}
              adminMessage={adminMessage}
              onProceedToPayment={onProceedToPayment}
            />
          </Tabs.Panel>

          <Tabs.Panel value="documentation">
            <DocumentDetail
              transactionTypeLabel={transactionTypeLabel}
              documents={documents}
              onViewTransaction={onViewTransaction ?? onClose}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </Drawer>
  );
}
