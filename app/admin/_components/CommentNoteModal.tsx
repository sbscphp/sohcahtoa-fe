"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Text, Textarea } from "@mantine/core";

interface CommentNoteModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  loading?: boolean;
  title?: string;
  placeholder?: string;
  submitLabel?: string;
}

export default function CommentNoteModal({
  opened,
  onClose,
  onSubmit,
  loading = false,
  title = "Leave comment",
  placeholder = "Write comment here",
  submitLabel = "Post Note",
}: CommentNoteModalProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) {
      setMessage("");
      setError(null);
    }
  }, [opened]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Comment is required.");
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
      title={
        <Text className="text-body-heading-300! text-xl! font-bold!">
          {title}
        </Text>
      }
    >
      <div className="space-y-4 pt-1">
        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={(event) => {
            setMessage(event.currentTarget.value);
            if (error) {
              setError(null);
            }
          }}
          minRows={5}
          autosize
          radius="md"
          disabled={loading}
          error={error || undefined}
        />

        <div className="flex justify-end">
          <Button
            radius="xl"
            color="#DD4F05"
            loading={loading}
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 font-medium! text-sm!"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
