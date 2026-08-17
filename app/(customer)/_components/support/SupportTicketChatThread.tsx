"use client";

import { useMemo, useState } from "react";
import type {
  SupportTicketAttachment,
  SupportTicketComment,
  SupportTicketDetail,
} from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
import DocumentViewerModal from "@/app/(customer)/_components/modals/DocumentViewerModal";

const LONG_MESSAGE_CHARS = 280;

function isStaffRole(role: string | undefined): boolean {
  const r = (role ?? "").toUpperCase();
  return r.includes("ADMIN") || r.includes("AGENT") || r.includes("STAFF");
}

function supportAuthorLabel(author: SupportTicketComment["author"]): string {
  if (isStaffRole(author.role)) return "Sohcahtoa Support";
  return author.name?.trim() || "Support";
}

export type ThreadBubble = {
  id: string;
  side: "customer" | "support";
  authorLabel: string;
  message: string;
  createdAt: string;
  attachments?: SupportTicketAttachment[];
};

function ExpandableBubbleText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > LONG_MESSAGE_CHARS;
  const shown =
    !isLong || expanded ? text : `${text.slice(0, LONG_MESSAGE_CHARS).trimEnd()}…`;

  return (
    <div className="space-y-1">
      <p className="text-sm leading-5 whitespace-pre-wrap wrap-break-word">{shown}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-primary-400 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function AttachmentLink({
  attachment,
  onOpen,
}: {
  attachment: SupportTicketAttachment;
  onOpen: (att: SupportTicketAttachment) => void;
}) {
  return (
    <button
      type="button"
      className="text-primary-400 text-xs font-medium hover:underline text-left wrap-break-word"
      onClick={() => onOpen(attachment)}
    >
      {attachment.fileName}
    </button>
  );
}

function ChatBubble({
  bubble,
  onOpenAttachment,
}: {
  bubble: ThreadBubble;
  onOpenAttachment: (att: SupportTicketAttachment) => void;
}) {
  const isCustomer = bubble.side === "customer";

  return (
    <div className={`flex w-full ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 space-y-1.5 ${
          isCustomer
            ? "bg-primary-25 text-[#4D4B4B] rounded-br-md"
            : "bg-[#F5F5F5] text-[#4D4B4B] rounded-bl-md"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-semibold text-[#6C6969]">{bubble.authorLabel}</span>
          <span className="text-[10px] text-[#8F8B8B] shrink-0">
            {formatHeaderDateTime(bubble.createdAt) || bubble.createdAt}
          </span>
        </div>
        <ExpandableBubbleText text={bubble.message} />
        {bubble.attachments && bubble.attachments.length > 0 ? (
          <ul className="space-y-1 pt-1">
            {bubble.attachments.map((att) => (
              <li key={att.id}>
                <AttachmentLink attachment={att} onOpen={onOpenAttachment} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** Builds chat bubbles from ticket description + comments (API shape). */
export function buildSupportThreadBubbles(detail: SupportTicketDetail): ThreadBubble[] {
  const items: ThreadBubble[] = [];

  if (detail.description?.trim()) {
    items.push({
      id: `request-${detail.id}`,
      side: "customer",
      authorLabel: "You",
      message: detail.description.trim(),
      createdAt: detail.createdAt,
      attachments: detail.attachments,
    });
  }

  const comments = [...(detail.comments ?? [])].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );

  for (const comment of comments) {
    const staff = isStaffRole(comment.author?.role);
    items.push({
      id: comment.id,
      side: staff ? "support" : "customer",
      authorLabel: staff
        ? supportAuthorLabel(comment.author)
        : comment.author?.name?.trim() || "You",
      message: comment.message?.trim() || "—",
      createdAt: comment.createdAt,
    });
  }

  if (comments.length === 0 && detail.messages?.length) {
    for (const m of detail.messages) {
      items.push({
        id: m.id,
        side: "support",
        authorLabel: m.from || "Sohcahtoa Support",
        message: m.message?.trim() || "—",
        createdAt: m.createdAt,
      });
    }
  }

  return items;
}

interface SupportTicketChatThreadProps {
  detail: SupportTicketDetail;
}

export default function SupportTicketChatThread({
  detail,
}: SupportTicketChatThreadProps) {
  const [docViewerOpened, setDocViewerOpened] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const bubbles = useMemo(() => buildSupportThreadBubbles(detail), [detail]);

  if (bubbles.length === 0) {
    return (
      <p className="text-sm text-[#8F8B8B] text-center py-6">
        No messages on this request yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {bubbles.map((bubble) => (
          <ChatBubble
            key={bubble.id}
            bubble={bubble}
            onOpenAttachment={(att) => {
              setActiveAttachment({ url: att.fileUrl, filename: att.fileName });
              setDocViewerOpened(true);
            }}
          />
        ))}
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
    </>
  );
}
