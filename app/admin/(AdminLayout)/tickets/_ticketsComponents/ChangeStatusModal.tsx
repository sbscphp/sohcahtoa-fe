"use client";

import { Modal, Text } from "@mantine/core";

export type TicketStatusOption = "In-progress" | "Resolved" | "Re-opened" | "Closed";

const STATUS_OPTIONS: {
  value: TicketStatusOption;
  label: string;
  description: string;
  pillBg: string;
}[] = [
  {
    value: "In-progress",
    label: "In-progress",
    description: "Incident acknowledged / being worked on",
    pillBg: "#B54708",
  },
  {
    value: "Resolved",
    label: "Resolved",
    description: "Fix or resolution implemented",
    pillBg: "#027A48",
  },
  {
    value: "Re-opened",
    label: "Re-opened",
    description: "Issue persists after resolution",
    pillBg: "#2563EB",
  },
  {
    value: "Closed",
    label: "Closed",
    description: "Verified and no further action needed",
    pillBg: "#6B7280",
  },
];

interface ChangeStatusModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect?: (status: TicketStatusOption) => void;
}

export default function ChangeStatusModal({
  opened,
  onClose,
  onSelect,
}: ChangeStatusModalProps) {
  const handleSelect = (status: TicketStatusOption) => {
    onSelect?.(status);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Change Status"
      centered
      radius="lg"
      size="sm"
    >
      <div className="divide-y divide-gray-200">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className="flex w-full flex-col items-start gap-1 px-0 py-3 text-left hover:bg-gray-50 rounded transition-colors"
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: opt.pillBg }}
            >
              {opt.label}
            </span>
            <Text size="sm" c="dimmed">
              {opt.description}
            </Text>
          </button>
        ))}
      </div>
    </Modal>
  );
}
