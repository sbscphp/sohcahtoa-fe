"use client";

import { useMemo, useState } from "react";
import { Button, Modal, Text, Textarea } from "@mantine/core";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type TicketStatusCode,
  type TicketStatusOptionItem,
} from "@/app/admin/_services/admin-api";
import { type ApiResponse } from "@/app/_lib/api/client";

export interface TicketStatusSelection {
  status: TicketStatusCode;
  notes: string;
}

const STATUS_PILL_BG: Record<TicketStatusCode, string> = {
  OPEN: "#1D4ED8",
  IN_PROGRESS: "#B54708",
  RESOLVED: "#027A48",
  REOPENED: "#2563EB",
  CLOSED: "#6B7280",
};

function formatStatusLabel(status: TicketStatusCode): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join("-");
}

function normalizeStatusOptions(data: unknown): TicketStatusOptionItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => {
      const statusValue =
        typeof item.status === "string" ? item.status.toUpperCase() : "";
      const noteValue = typeof item.note === "string" ? item.note : "";
      const conditionValue =
        typeof item.condition === "string" ? item.condition : undefined;

      const normalizedStatus =
        statusValue === "REOPEN"
          ? "REOPENED"
          : (statusValue as TicketStatusCode);

      return {
        status: normalizedStatus,
        note: noteValue,
        condition: conditionValue,
      };
    })
    .filter(
      (item) =>
        item.status === "OPEN" ||
        item.status === "IN_PROGRESS" ||
        item.status === "RESOLVED" ||
        item.status === "REOPENED" ||
        item.status === "CLOSED"
    );
}

interface ChangeStatusModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect?: (selection: TicketStatusSelection) => void;
  loading?: boolean;
  currentStatus?: TicketStatusCode | null;
}

export default function ChangeStatusModal({
  opened,
  onClose,
  onSelect,
  loading = false,
  currentStatus = null,
}: ChangeStatusModalProps) {
  const statusQuery = useFetchData<ApiResponse<TicketStatusOptionItem[]>>(
    [...adminKeys.tickets.statuses()],
    () =>
      adminApi.tickets.getStatuses() as unknown as Promise<
        ApiResponse<TicketStatusOptionItem[]>
      >,
    true
  );
  const [selectedStatus, setSelectedStatus] = useState<TicketStatusCode | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const availableStatuses = useMemo(() => {
    const normalized = normalizeStatusOptions(statusQuery.data?.data);
    if (!normalized.length) {
      return [];
    }

    const canReopenOrOpen =
      currentStatus === "RESOLVED" || currentStatus === "CLOSED";

    return normalized.filter((item) => {
      if (item.status === "REOPENED" || item.status === "OPEN") {
        return canReopenOrOpen;
      }

      return true;
    });
  }, [currentStatus, statusQuery.data?.data]);

  const handleClose = () => {
    setSelectedStatus(null);
    setNotes("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (statusQuery.isLoading) {
      return;
    }

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
      {statusQuery.isError ? (
        <Text size="sm" c="red" mb="md">
          Unable to load status options. Please try again.
        </Text>
      ) : statusQuery.isLoading ? (
        <Text size="sm" c="dimmed" mb="md">
          Loading status options...
        </Text>
      ) : (
        <div className="divide-y divide-gray-200">
          {availableStatuses.map((opt) => (
            <button
              key={opt.status}
              type="button"
              onClick={() => {
                setSelectedStatus(opt.status);
                setNotes(opt.note ?? "");
                setError(null);
              }}
              className={`flex w-full flex-col items-start gap-1 rounded px-2 py-3 text-left transition-colors ${
                selectedStatus === opt.status
                  ? "bg-orange-50 ring-1 ring-orange-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{
                  backgroundColor:
                    STATUS_PILL_BG[opt.status] ?? STATUS_PILL_BG.IN_PROGRESS,
                }}
              >
                {formatStatusLabel(opt.status)}
              </span>
              <Text size="sm" c="dimmed">
                {opt.note || "--"}
              </Text>
              {opt.condition && (
                <Text size="xs" c="dimmed">
                  {opt.condition}
                </Text>
              )}
            </button>
          ))}
          {availableStatuses.length === 0 && (
            <Text size="sm" c="dimmed" px={8} py={10}>
              No status options available for this ticket.
            </Text>
          )}
        </div>
      )}
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
        <Button
          color="#DD4F05"
          radius="xl"
          onClick={handleSubmit}
          loading={loading}
          disabled={statusQuery.isLoading || statusQuery.isError}
        >
          Update Status
        </Button>
      </div>
    </Modal>
  );
}
