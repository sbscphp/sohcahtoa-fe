"use client";

import { useState } from "react";
import { Modal, Select, Button, Text, Checkbox, NumberInput, Group } from "@mantine/core";
import { X } from "lucide-react";

interface EscalationProtocolModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (escalateToId: string, escalateToName: string, minutes: number) => void;
  users: Array<{ id: string; name: string }>;
  initialEscalateToId?: string | null;
  initialMinutes?: number;
}

const TIME_OPTIONS = [
  { value: 5, label: "5 Mins" },
  { value: 10, label: "10 Mins" },
  { value: 20, label: "20 Mins" },
  { value: 30, label: "30 Mins" },
  { value: 60, label: "1 Hour" },
];

const CHIP_VALUES = TIME_OPTIONS.map((o) => o.value);

function deriveInitialTime(mins: number | undefined): {
  selectedTime: number | null;
  customTime: number | "";
} {
  if (!mins || mins <= 0) return { selectedTime: null, customTime: "" };
  if (CHIP_VALUES.includes(mins)) return { selectedTime: mins, customTime: "" };
  return { selectedTime: null, customTime: mins };
}

export default function EscalationProtocolModal({
  opened,
  onClose,
  onSave,
  users,
  initialEscalateToId,
  initialMinutes,
}: EscalationProtocolModalProps) {
  const { selectedTime: initSelected, customTime: initCustom } = deriveInitialTime(initialMinutes);

  const [escalateToId, setEscalateToId] = useState<string | null>(initialEscalateToId ?? null);
  const [selectedTime, setSelectedTime] = useState<number | null>(initSelected);
  const [customTime, setCustomTime] = useState<number | "">(initCustom);

  const handleSave = () => {
    if (!escalateToId) return;
    const minutes = customTime !== "" ? Number(customTime) : selectedTime ?? 0;
    const userName = users.find((u) => u.id === escalateToId)?.name || "";

    if (minutes > 0) {
      onSave(escalateToId, userName, minutes);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const isSaveDisabled =
    !escalateToId || (selectedTime === null && (customTime === "" || Number(customTime) <= 0));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <Text fw={700} size="lg" className="text-gray-900">
            Escalate Protocol
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Set escalation protocol for this workflow line
          </Text>
        </div>
      }
      centered
      radius="lg"
      size="md"
      classNames={{ title: "!mb-0" }}
      closeButtonProps={{
        icon: (
          <X
            size={20}
            className="bg-[#e69fb6]! text-pink-500! font-bold! rounded-full! p-1! hover:bg-[#e69fb6]/80! transition-all! duration-300!"
          />
        ),
      }}
    >
      <div className="space-y-6">
        {/* Escalate To */}
        <Select
          label="Escalate Review Issue to ?"
          placeholder="Select user"
          data={userOptions}
          value={escalateToId}
          onChange={setEscalateToId}
          required
          searchable
          radius="md"
          classNames={{
            label: "text-sm font-medium text-gray-900 mb-1",
          }}
        />

        {/* Time Selection */}
        <div>
          <Text size="sm" fw={500} className="text-gray-900 mb-3">
            How many minutes before action gets escalated?{" "}
            <span className="text-red-500">*</span>
          </Text>

          <div className="space-y-4">
            {/* Chip Options */}
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((option) => {
                const isActive = selectedTime === option.value && customTime === "";
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedTime(option.value);
                      setCustomTime("");
                    }}
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <Checkbox
                      checked={isActive}
                      onChange={() => {}}
                      color="white"
                      size="xs"
                      classNames={{
                        input: isActive ? "!bg-white !border-white" : "",
                      }}
                      readOnly
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Minutes Input */}
            <div>
              <Text size="sm" c="dimmed" mb={8}>
                Or enter custom minutes
              </Text>
              <NumberInput
                placeholder="e.g. 45"
                value={customTime}
                onChange={(val) => {
                  setCustomTime(typeof val === "number" ? val : "");
                  setSelectedTime(null);
                }}
                min={1}
                radius="md"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <Group justify="flex-end" gap="sm" mt="xl">
          <Button variant="outline" color="gray" radius="xl" onClick={handleClose}>
            No, Close
          </Button>
          <Button
            color="#DD4F05"
            radius="xl"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            Yes, Set Protocol
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
