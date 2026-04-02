"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import type { AgentSupportTicketDetailData } from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import Loader from "@/components/loader";

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

export default function ViewSupportRequestPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useFetchSingleData(
    agentKeys.support.tickets.detail(id) as unknown as unknown[],
    () => agentApi.support.tickets.getById(id),
    !!id
  );

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader />
      </div>
    );
  }

  const detail = data.data as AgentSupportTicketDetailData;

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
          <div className="flex flex-col w-full gap-1 py-2 items-start">
            <span className="text-[#6C6969] text-sm font-normal">Category</span>
            <span className="text-sm font-medium text-[#4D4B4B]">{getCategoryLabel(detail.category)}</span>
          </div>
          <div className="flex flex-col w-full gap-1 py-2 items-end text-right">
            <span className="text-[#6C6969] text-sm font-normal">Status</span>
            <span style={getStatusBadge(detail.status)}>{detail.status}</span>
          </div>
          <div className="flex flex-col w-full gap-1 py-2 items-start">
            <span className="text-[#6C6969] text-sm font-normal">Reference</span>
            <span className="text-sm font-medium text-[#4D4B4B]">{detail.reference}</span>
          </div>
          <div className="flex flex-col w-full gap-1 py-2 items-end text-right">
            <span className="text-[#6C6969] text-sm font-normal">Date & Time</span>
            <span className="text-sm font-medium text-[#4D4B4B]">
              {formatHeaderDateTime(detail.timestamp) || detail.timestamp}
            </span>
          </div>
        </div>
        {detail.description && (
          <div className="pt-2">
            <p className="text-[#4D4B4B] text-sm font-normal leading-6 whitespace-pre-wrap">
              {detail.description}
            </p>
          </div>
        )}

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
              {detail.messages.map((m, idx) => (
                <div key={`${m.senderTimestamp}-${idx}`} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[#6C6969]">{m.senderMail}</span>
                    <span className="text-[11px] text-[#8F8B8B]">
                      {formatHeaderDateTime(m.senderTimestamp) || m.senderTimestamp}
                    </span>
                  </div>
                  <p className="text-[#4D4B4B] text-sm leading-5 whitespace-pre-wrap">{m.senderMessage}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <Link href="/agent/support/history">
          <Button
            variant="outline"
            radius="xl"
            className="min-h-[44px] px-6 border-text-50 text-[#4D4B4B] hover:bg-gray-50"
          >
            Back to Support History
          </Button>
        </Link>
      </div>
    </div>
  );
}
