"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Button } from "@mantine/core";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { HugeiconsIcon } from '@hugeicons/react';
import { Message01Icon } from "@hugeicons/core-free-icons";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { SupportTicketDetail } from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
import Loader from "@/components/loader";
import DocumentViewerModal from "@/app/(customer)/_components/modals/DocumentViewerModal";

function getCategoryLabel(category: string): string {
  const match = [
    { value: "TRANSACTION_ISSUE", label: "Transaction issue" },
    { value: "ACCOUNT_ACCESS", label: "Account access" },
    { value: "PAYMENT_ISSUE", label: "Payment issue" },
    { value: "DOCUMENT_VERIFICATION", label: "Document verification" },
    { value: "TECHNICAL_ISSUE", label: "Technical issue" },
    { value: "COMPLIANCE_INQUIRY", label: "Compliance / regulatory inquiry" },
    { value: "GENERAL_INQUIRY", label: "General inquiry" },
    { value: "OTHER", label: "Other" },
  ].find((opt) => opt.value === category);
  return match?.label ?? category;
}

function DetailRow({
  label,
  value,
  valueClassName,
  valueStyle,
  align = "left",
}: {
  label: string;
  value: string;
  valueClassName?: string;
  /** Inline style for the value (e.g. from getStatusBadge for status pills). */
  valueStyle?: CSSProperties;
  align?: "left" | "right";
}) {
  const isRight = align === "right";
  return (
    <div
      className={`flex flex-col w-full gap-1 py-2 ${isRight ? "items-end text-right" : "items-start"}`}
    >
      <span className="text-[#6C6969] text-sm font-normal">{label}</span>
      <span
        className={`text-sm font-medium ${!valueStyle ? "text-[#4D4B4B]" : ""} ${valueClassName ?? ""}`}
        style={valueStyle}
      >
        {value}
      </span>
    </div>
  );
}

export default function ViewSupportDetail({ id }: { id: string }) {
  const [docViewerOpened, setDocViewerOpened] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const { data, isLoading } = useFetchSingleData(
    [...customerKeys.support.tickets.detail(id), "detail"],
    () => customerApi.support.tickets.getById(id),
    !!id
  );

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader />
      </div>
    );
  }

  const detail = data.data as SupportTicketDetail;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 w-full max-w-[720px] mx-auto">
      <div className="space-y-2 mb-6">
        <h2 className="text-body-heading-300 text-xl md:text-2xl font-bold">
          Support
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          View request
        </p>
      </div>

      <div className="space-y-4">
        {/* Ticket summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
          <DetailRow label="Category" value={getCategoryLabel(detail.category)} />
          <DetailRow
            align="right"
            label="Status"
            value={detail.status}
            valueStyle={getStatusBadge(detail.status)}
          />
          <DetailRow
            label="Reference"
            value={detail.reference}
          />
          <DetailRow
            label="Date & Time"
            value={formatHeaderDateTime(detail.createdAt) || detail.createdAt}
            align="right"
          />
        </div>
        {detail.description && (
          <div className="pt-2">
            <p className="text-[#4D4B4B] text-sm font-normal leading-6 whitespace-pre-wrap">
              {detail.description}
            </p>
          </div>
        )}

        {detail.attachments && detail.attachments.length > 0 && (
          <div className="pt-4 space-y-2">
            <span className="text-[#6C6969] text-sm font-normal">Attachments</span>
            <ul className="list-disc pl-5 space-y-1">
              {detail.attachments.map((att) => (
                <li key={att.id}>
                  <button
                    type="button"
                    className="text-primary-400 text-sm hover:underline"
                    onClick={() => {
                      setActiveAttachment({ url: att.fileUrl, filename: att.fileName });
                      setDocViewerOpened(true);
                    }}
                  >
                    {att.fileName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Messages thread (if provided) */}
        {detail.messages && detail.messages.length > 0 && (
          <>
            <hr className="border-t border-gray-100 my-6" />

            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded bg-[#FDF5F2] text-primary-400">
                <HugeiconsIcon icon={Message01Icon} size={18} />
              </span>
              <span className="text-[#4D4B4B] font-semibold text-sm">Messages</span>
            </div>

            <div className="space-y-4">
              {detail.messages.map((m) => (
                <div key={m.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[#6C6969]">
                      {m.from}
                    </span>
                    <span className="text-[11px] text-[#8F8B8B]">
                      {formatHeaderDateTime(m.createdAt) || m.createdAt}
                    </span>
                  </div>
                  <p className="text-[#4D4B4B] text-sm leading-5 whitespace-pre-wrap">
                    {m.message}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <Link href="/support/history">
          <Button
            variant="outline"
            radius="xl"
            className="min-h-[44px] px-6 border-text-50 text-[#4D4B4B] hover:bg-gray-50"
          >
            Back to Support History
          </Button>
        </Link>
      </div>

      <DocumentViewerModal
        opened={docViewerOpened}
        onClose={() => {
          setDocViewerOpened(false);
          setActiveAttachment(null);
        }}
        fileUrl={activeAttachment?.url ?? null}
        filename={activeAttachment?.filename ?? "Attachment"}
      />
    </div>
  );
}
