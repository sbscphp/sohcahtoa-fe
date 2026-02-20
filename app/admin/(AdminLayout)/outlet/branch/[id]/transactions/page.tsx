"use client";

import { useSearchParams } from "next/navigation";
import { Text, Group } from "@mantine/core";
import { FileText, Download } from "lucide-react";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CustomButton } from "@/app/admin/_components/CustomButton";

// Mock transaction detail – replace with API when available
const getTransactionDetail = (txId: string | null) => ({
  // PTA Documents
  bvn: "2223334355",
  tin: "488559859",
  ptaStatus: "Completed",
  formA: "Form A-document.pdf",
  internationalPassport: "Passport-document.pdf",
  visa: "Visa-document.pdf",
  cac: "CAC-document.pdf",
  returnTicket: "Ticket-document.pdf",
  utilityBill: "Utility-document.pdf",
  // Transaction Details
  branchName: "Sterling Exchange",
  agent: "Eddy Ubong",
  timestamp: "September 22, 2025 | 12:09 pm",
  transactionId: txId ?? "2223334355",
  amountTransferred: "NGN 400,000.00",
  equivalentAmount: "$ 400",
  dateInitiated: "25 Jun 2025",
  paymentReceipt: "Invoice-document.pdf",
  paymentStatus: "Payment Received",
  // Beneficiary Information
  bankName: "UBA Bank",
  accountName: "Adeola Aderinsola",
  accountNumber: "2223334355",
  iban: "2223334355",
  disbursementDate: "Jan 25 2025",
  transactionReceipt: "Receipt-document.pdf",
});

function DocumentRow({
  label,
  filename,
}: {
  label: string;
  filename: string;
}) {
  return (
    <div className="space-y-1">
      <Text size="xs" className="text-body-text-50!" mb={4}>
        {label}
      </Text>
      <Group gap={6} wrap="nowrap">
        <Text fw={500} size="sm" className="wrap-break-word">
          {filename}
        </Text>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          <FileText size={14} className="shrink-0" />
          View
        </a>
      </Group>
    </div>
  );
}

export default function BranchTransactionDetailPage() {
  const searchParams = useSearchParams();
  const txId = searchParams?.get("tx") ?? "tx1";

  const tx = getTransactionDetail(txId);

  return (
    <div className="space-y-6">
      {/* PTA Documents */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Text className="mb-5! text-xl! font-bold! text-text-500!">
          PTA Documents
        </Text>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="BVN" value={tx.bvn} />
          <DetailItem label="TIN" value={tx.tin} />
          <div className="space-y-1">
            <Text size="xs" className="text-body-text-50!" mb={4}>
              Status
            </Text>
            <StatusBadge status={tx.ptaStatus} />
          </div>
          <DocumentRow label="Form A" filename={tx.formA} />
          <DocumentRow label="International Passport" filename={tx.internationalPassport} />
          <DocumentRow label="Visa" filename={tx.visa} />
          <DocumentRow label="CAC" filename={tx.cac} />
          <DocumentRow label="Return Ticket" filename={tx.returnTicket} />
          <DocumentRow label="Utility Bill" filename={tx.utilityBill} />
        </div>
      </div>

      {/* Transaction Details */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Group justify="space-between" mb="lg">
          <Text className="text-xl! font-bold! text-text-500!">
            Transaction Details
          </Text>
          <CustomButton
            leftSection={<Download size={16} />}
            onClick={() => {}}
            buttonType="secondary"
            size="md"
          >
            Export
          </CustomButton>
        </Group>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Branch Name" value={tx.branchName} />
          <DetailItem label="Agent" value={tx.agent} />
          <DetailItem label="Timestamp" value={tx.timestamp} />
          <DetailItem label="Transaction ID" value={tx.transactionId} />
          <DetailItem label="Amount Transferred" value={tx.amountTransferred} />
          <DetailItem label="Equivalent Amount" value={tx.equivalentAmount} />
          <DetailItem label="Date initiated" value={tx.dateInitiated} />
          <DocumentRow label="Payment Receipt" filename={tx.paymentReceipt} />
          <div className="space-y-1">
            <Text size="xs" className="text-body-text-50!" mb={4}>
              Payment Status
            </Text>
            <StatusBadge status={tx.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Beneficiary Information */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Text className="mb-5! text-xl! font-bold! text-text-500!">
          Beneficiary Information
        </Text>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Bank Name" value={tx.bankName} />
          <DetailItem label="Account Name" value={tx.accountName} />
          <DetailItem label="Account Number" value={tx.accountNumber} />
          <DetailItem label="Iban" value={tx.iban} />
          <DetailItem label="Disbursement Date" value={tx.disbursementDate} />
          <DocumentRow label="Transaction Receipt" filename={tx.transactionReceipt} />
        </div>
      </div>
    </div>
  );
}
