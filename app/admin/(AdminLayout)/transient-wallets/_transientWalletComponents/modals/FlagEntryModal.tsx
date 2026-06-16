"use client";

import { useState } from "react";
import { Button, Modal, Select, Text, Textarea } from "@mantine/core";
import { X } from "lucide-react";

const FLAG_REASONS = [
  "Duplicate payment",
  "Suspected fraud",
  "Amount mismatch",
  "Other",
];

interface FlagEntryModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
  loading?: boolean;
}

export default function FlagEntryModal({
  opened,
  onClose,
  onSubmit,
  loading = false,
}: FlagEntryModalProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [prevOpened, setPrevOpened] = useState(opened);

  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (!opened) {
      setReason(null);
      setDescription("");
    }
  }

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, description.trim());
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
            Flag Entry
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

      <div className="space-y-4 px-6 py-5">
        <div>
          <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
            Reason for flagging <span className="text-red-500">*</span>
          </Text>
          <Select
            placeholder="Select reason for flagging"
            value={reason}
            onChange={setReason}
            data={FLAG_REASONS}
            radius="md"
            disabled={loading}
          />
        </div>
        <div>
          <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
            Further description
          </Text>
          <Textarea
            placeholder="Enter more details if any"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            minRows={4}
            radius="md"
            disabled={loading}
          />
        </div>
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
          loading={loading}
          onClick={handleSubmit}
          disabled={loading || !reason}
          className="font-medium!"
        >
          Flag Entry
        </Button>
      </div>
    </Modal>
  );
}
