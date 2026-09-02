"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Button } from "@mantine/core";
import { getSupportStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { SupportTicketDetail } from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
import Loader from "@/components/loader";
import DocumentViewerModal from "@/app/(customer)/_components/modals/DocumentViewerModal";
import SupportConversationModal from "@/app/(customer)/_components/support/SupportConversationModal";


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
  const [conversationOpened, setConversationOpened] = useState(false);
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
  const commentCount = detail.comments?.length ?? detail.messages?.length ?? 0;
  const hasConversation =
    Boolean(detail.description?.trim()) || commentCount > 0;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
          <DetailRow label="Category" value={getCategoryLabel(detail.category)} />
          <DetailRow
            align="right"
            label="Status"
            value={detail.status}
            valueStyle={getSupportStatusBadge(detail.status)}
          />
          <DetailRow label="Reference" value={detail.reference} />
          <DetailRow
            label="Date & Time"
            value={formatHeaderDateTime(detail.createdAt) || detail.createdAt}
            align="right"
          />
        </div>

        {detail.description ? (
          <div className="pt-2">
            <p className="text-[#4D4B4B] text-sm font-normal leading-6 whitespace-pre-wrap">
              {detail.description}
            </p>
          </div>
        ) : null}

        {detail.attachments && detail.attachments.length > 0 ? (
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
        ) : null}

        {hasConversation ? (
          <div className="pt-2">
            <Button
              type="button"
              variant="light"
              radius="xl"
              className="bg-primary-25! text-primary-400! hover:bg-[#F8DCCD]! min-h-[44px] px-5"
              onClick={() => setConversationOpened(true)}
            >
              View conversation
              {commentCount > 0 ? ` (${commentCount})` : ""}
            </Button>
          </div>
        ) : null}
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

      <SupportConversationModal
        opened={conversationOpened}
        onClose={() => setConversationOpened(false)}
        detail={detail}
      />
    </div>
  );
}
