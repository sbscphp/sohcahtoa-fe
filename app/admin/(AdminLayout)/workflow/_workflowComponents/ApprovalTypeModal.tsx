"use client";

import { useState } from "react";
import { Modal, TextInput, Radio, ScrollArea, Text } from "@mantine/core";
import { Search } from "lucide-react";

export type ApprovalTypeValue = "TRANSACTION" | "REFUND" | "RATE";

interface ApprovalTypeOption {
  value: ApprovalTypeValue;
  label: string;
}

const APPROVAL_TYPE_OPTIONS: ApprovalTypeOption[] = [
  { value: "TRANSACTION", label: "Transaction Approval" },
  { value: "REFUND", label: "Transaction Refund Approval" },
  { value: "RATE", label: "Rate Approval" },
];

export function approvalTypeLabel(value: ApprovalTypeValue | ""): string {
  return APPROVAL_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "";
}

interface ApprovalTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (value: ApprovalTypeValue) => void;
  value?: ApprovalTypeValue | "";
}

export default function ApprovalTypeModal({
  opened,
  onClose,
  onSelect,
  value,
}: ApprovalTypeModalProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = APPROVAL_TYPE_OPTIONS.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (value: ApprovalTypeValue) => {
    onSelect(value);
    onClose();
    setSearch("");
  };

  const handleClose = () => {
    onClose();
    setSearch("");
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <Text fw={700} size="lg" className="text-gray-900">
            Approval Type
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Select an approval type below
          </Text>
        </div>
      }
      centered
      radius="lg"
      size="md"
      classNames={{ title: "!mb-0" }}
    >
      <div className="space-y-4">
        <TextInput
          placeholder="Enter keyword to search"
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="md"
        />

        <ScrollArea h={200} type="scroll">
          <Radio.Group value={value ?? ""}>
            <div className="space-y-2">
              {filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    <Radio
                      value={option.value}
                      label={option.label}
                      color="orange"
                      classNames={{
                        label: "text-sm font-medium text-gray-900 cursor-pointer",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </Radio.Group>
        </ScrollArea>
      </div>
    </Modal>
  );
}
