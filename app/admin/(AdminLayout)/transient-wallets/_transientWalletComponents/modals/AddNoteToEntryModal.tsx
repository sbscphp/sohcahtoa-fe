"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Text, Textarea } from "@mantine/core";
import { X } from "lucide-react";

const MAX_NOTE_LENGTH = 100;

interface AddNoteToEntryModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  loading?: boolean;
}

export default function AddNoteToEntryModal({
  opened,
  onClose,
  onSubmit,
  loading = false,
}: AddNoteToEntryModalProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) {
      setNote("");
      setError(null);
    }
  }, [opened]);

  const handleSubmit = () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Note is required.");
      return;
    }
    if (trimmed.length > MAX_NOTE_LENGTH) {
      setError(`Note must not exceed ${MAX_NOTE_LENGTH} characters.`);
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
            Add Note to Entry
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
          Note <span className="text-red-500">*</span>
        </Text>
        <Textarea
          placeholder="Enter your note"
          value={note}
          onChange={(event) => {
            const value = event.currentTarget.value.slice(0, MAX_NOTE_LENGTH);
            setNote(value);
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
          disabled={loading || !note.trim()}
          className="font-medium!"
        >
          Add Note
        </Button>
      </div>
    </Modal>
  );
}
