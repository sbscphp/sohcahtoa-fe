"use client";

import { useState } from "react";
import { Button, Modal, Text, Textarea } from "@mantine/core";

export type TicketStatusOption = "In-progress" | "Resolved" | "Re-opened" | "Closed";
export interface TicketStatusSelection {
  status: TicketStatusOption;
  notes: string;
}

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
  onSelect?: (selection: TicketStatusSelection) => void;
  loading?: boolean;
}

export default function ChangeStatusModal({
  opened,
  onClose,
  onSelect,
  loading = false,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatusOption | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedStatus(null);
    setNotes("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedStatus) {
      setError("Please select a status.");
      return;
    }

    if (!notes.trim()) {
      setError("Please add notes.");
      return;
    }

    setError(null);
    onSelect?.({
      status: selectedStatus,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
            onClick={() => setSelectedStatus(opt.value)}
            className={`flex w-full flex-col items-start gap-1 rounded px-2 py-3 text-left transition-colors ${
              selectedStatus === opt.value
                ? "bg-orange-50 ring-1 ring-orange-200"
                : "hover:bg-gray-50"
            }`}
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
      <Textarea
        label="Notes"
        placeholder="Add notes for this status update"
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        minRows={3}
        mt="md"
      />
      {error && (
        <Text size="xs" c="red" mt="xs">
          {error}
        </Text>
      )}
      <div className="mt-4 flex justify-end">
        <Button color="#DD4F05" radius="xl" onClick={handleSubmit} loading={loading}>
          Update Status
        </Button>
      </div>
    </Modal>
  );
}
