"use client";

import { Modal, Button } from "@mantine/core";
import { CheckCircle2 } from "lucide-react";

interface PasswordCreatedModalProps {
  opened: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function PasswordCreatedModal({
  opened,
  onClose,
  onContinue,
}: PasswordCreatedModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      radius="lg"
      size="md"
    >
      <div className="space-y-6 pb-4 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            {/* Radiating dots effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-green-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-body-heading-300 text-xl font-bold">
          Password Created, Profile Active
        </h2>

        {/* Message */}
        <p className="text-body-text-100 text-sm leading-relaxed">
          Your password has been created successfully, and your agent account now active. Log in to get started.
        </p>

        {/* Action Button */}
        <Button
          onClick={onContinue}
          color="orange"
          radius="xl"
          size="lg"
          fullWidth
          className="font-medium"
        >
          Continue to log in →
        </Button>
      </div>
    </Modal>
  );
}
