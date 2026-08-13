"use client";

import { Modal } from "@mantine/core";
import type { SupportTicketDetail } from "@/app/_lib/api/types";
import SupportTicketChatThread from "@/app/(customer)/_components/support/SupportTicketChatThread";

export interface SupportConversationModalProps {
  opened: boolean;
  onClose: () => void;
  detail: SupportTicketDetail;
}

export default function SupportConversationModal({
  opened,
  onClose,
  detail,
}: SupportConversationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Conversation"
      centered
      size={560}
      radius="lg"
      classNames={{
        content:
          "!max-w-[560px] max-h-[min(85vh,720px)] p-0 overflow-hidden flex flex-col bg-white rounded-xl",
        header: "border-b border-gray-100 pb-4 px-5 pt-5 shrink-0",
        title: "text-lg font-bold text-[#4D4B4B] leading-7",
        body: "p-0 flex flex-col min-h-0 flex-1 overflow-hidden",
      }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 max-h-[min(65vh,560px)]">
        <p className="text-xs text-[#8F8B8B] mb-3 wrap-break-word">
          {detail.reference}
        </p>
        <SupportTicketChatThread detail={detail} />
      </div>
    </Modal>
  );
}
