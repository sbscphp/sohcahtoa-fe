"use client";

import { useParams } from "next/navigation";
import { Text, Group, Skeleton } from "@mantine/core";
import { FileText, Download } from "lucide-react";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import EmptySection from "@/app/admin/_components/EmptySection";
import { useBranchTransactionDetail } from "./useBranchTransactionDetail";

function DocumentRow({
  label,
  filename,
  fileUrl,
}: {
  label: string;
  filename: string;
  fileUrl?: string;
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
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline shrink-0"
          >
            <FileText size={14} className="shrink-0" />
            View
          </a>
        )}
      </Group>
    </div>
  );
}

function SectionSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={12} width="50%" radius="sm" />
          <Skeleton height={18} width="80%" radius="sm" />
        </div>
      ))}
    </div>
  );
}

export default function BranchTransactionDetailPage() {
  const params = useParams<{ id: string; transactionId: string }>();
  const transactionId = Array.isArray(params?.transactionId)
    ? params.transactionId[0]
    : params?.transactionId;

  const { documentsSection, txDetailsSection, beneficiarySection, isLoading, isError } =
    useBranchTransactionDetail(transactionId);

  if (!transactionId) {
    return (
      <div className="space-y-6">
        <EmptySection
          title="Transaction Not Found"
          description="A valid transaction ID is required to load this page."
        />
      </div>
    );
  }

  if (isError && !isLoading) {
    return (
      <div className="space-y-6">
        <EmptySection
          title="Failed to Load Transaction"
          description="Unable to retrieve transaction details. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Documents Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Text className="mb-5! text-xl! font-bold! text-text-500!">
          {isLoading ? "Documents" : (documentsSection?.title ?? "Documents")}
        </Text>

        {isLoading ? (
          <SectionSkeleton rows={9} />
        ) : !documentsSection ? (
          <EmptySection
            title="No Document Details"
            description="Document information is not available for this transaction."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documentsSection.bvnNumber !== "--" && (
              <DetailItem label="BVN" value={documentsSection.bvnNumber} />
            )}
            {documentsSection.tinNumber !== "--" && (
              <DetailItem label="TIN" value={documentsSection.tinNumber} />
            )}
            {documentsSection.formAId !== "--" && (
              <DetailItem label="Form A ID" value={documentsSection.formAId} />
            )}
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Status
              </Text>
              <StatusBadge status={documentsSection.statusLabel} />
            </div>
            {documentsSection.documents.length > 0
              ? documentsSection.documents.map((doc) => (
                  <DocumentRow
                    key={`${doc.label}-${doc.fileUrl}`}
                    label={doc.label}
                    filename={doc.fileName}
                    fileUrl={doc.fileUrl}
                  />
                ))
              : null}
          </div>
        )}
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

        {isLoading ? (
          <SectionSkeleton rows={6} />
        ) : !txDetailsSection ? (
          <EmptySection
            title="No Transaction Details"
            description="Transaction detail information is not available."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Transaction ID" value={txDetailsSection.reference} />
            <DetailItem label="Transaction Date" value={txDetailsSection.transactionDate} />
            <DetailItem label="Transaction Time" value={txDetailsSection.transactionTime} />
            <DetailItem label="Amount (NGN)" value={txDetailsSection.amountNgn} />
            <DetailItem label="Equivalent Amount" value={txDetailsSection.amountFx} />
            {txDetailsSection.receiptDocument ? (
              <DocumentRow
                label="Payment Receipt"
                filename={txDetailsSection.receiptDocument.fileName}
                fileUrl={txDetailsSection.receiptDocument.fileUrl}
              />
            ) : null}
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Payment Status
              </Text>
              <StatusBadge status={txDetailsSection.paymentStatusLabel} />
            </div>
          </div>
        )}
      </div>

      {/* Beneficiary Information — only rendered when data is available */}
      {(isLoading || beneficiarySection?.hasData) && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-5! text-xl! font-bold! text-text-500!">
            Beneficiary Information
          </Text>

          {isLoading ? (
            <SectionSkeleton rows={6} />
          ) : !beneficiarySection ? null : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beneficiarySection.bankName !== "--" && (
                <DetailItem label="Bank Name" value={beneficiarySection.bankName} />
              )}
              {beneficiarySection.accountName !== "--" && (
                <DetailItem label="Account Name" value={beneficiarySection.accountName} />
              )}
              {beneficiarySection.accountNumber !== "--" && (
                <DetailItem label="Account Number" value={beneficiarySection.accountNumber} />
              )}
              {beneficiarySection.ibanNumber !== "--" && (
                <DetailItem label="IBAN" value={beneficiarySection.ibanNumber} />
              )}
              {beneficiarySection.disbursementDate !== "--" && (
                <DetailItem
                  label="Disbursement Date"
                  value={beneficiarySection.disbursementDate}
                />
              )}
              {beneficiarySection.transactionReceiptDocument && (
                <DocumentRow
                  label="Transaction Receipt"
                  filename={beneficiarySection.transactionReceiptDocument.fileName}
                  fileUrl={beneficiarySection.transactionReceiptDocument.fileUrl}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
