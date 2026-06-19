"use client";

import { useState } from "react";
import { Button, Modal, Text, Textarea } from "@mantine/core";
import { X } from "lucide-react";

const MAX_NOTE_LENGTH = 100;

interface InitiateRefundModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  loading?: boolean;
}

export default function InitiateRefundModal({
  opened,
  onClose,
  onSubmit,
  loading = false,
}: InitiateRefundModalProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [prevOpened, setPrevOpened] = useState(opened);

  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (!opened) {
      setNotes("");
      setError(null);
    }
  }

  const handleSubmit = () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      setError("Notes are required.");
      return;
    }
    if (trimmed.length > MAX_NOTE_LENGTH) {
      setError(`Notes must not exceed ${MAX_NOTE_LENGTH} characters.`);
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="lg"
      withCloseButton={false}
      padding={0}
    >
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <Text className="text-body-heading-300! text-xl! font-bold!">
            Initiate Refund
          </Text>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 px-6 py-5">
        <Text size="sm" fw={500} className="text-body-heading-300!">
          Notes <span className="text-red-500">*</span>
        </Text>
        <Textarea
          placeholder="Enter refund notes"
          value={notes}
          onChange={(event) => {
            const value = event.currentTarget.value.slice(0, MAX_NOTE_LENGTH);
            setNotes(value);
            if (error) setError(null);
          }}
          minRows={5}
          autosize
          radius="md"
          disabled={loading}
          error={error || undefined}
        />
        <Text size="xs" c="dimmed">
          Not more than {MAX_NOTE_LENGTH} character counts
        </Text>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button
          radius="xl"
          variant="outline"
          color="gray"
          onClick={onClose}
          disabled={loading}
          className="border-text-50! font-semibold!"
        >
          Close
        </Button>
        <Button
          radius="xl"
          color="#DD4F05"
          loading={loading}
          onClick={handleSubmit}
          disabled={loading || !notes.trim()}
          className="font-medium!"
        >
          Initiate Refund
        </Button>
      </div>
    </Modal>
  );
}
