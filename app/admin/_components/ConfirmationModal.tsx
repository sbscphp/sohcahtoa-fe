"use client";

import { Modal, Button } from "@mantine/core";
import Image from "next/image";
import { exclamation } from "@/app/assets/asset";
import React from "react";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Primary (confirm) button label. Defaults to "Confirm". */
  primaryButtonText?: string;
  /** Secondary (cancel) button label. Defaults to "Cancel". */
  secondaryButtonText?: string;
  /** Called when the primary button is clicked. */
  onPrimary?: () => void;
  /** Called when the secondary button is clicked. Defaults to `onClose`. */
  onSecondary?: () => void;
  /** Optional custom icon to replace the default exclamation mark. */
  icon?: React.ReactNode;
  /** When true, disables buttons and shows loading state on the primary button. */
  loading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  title,
  message,
  primaryButtonText = "Confirm",
  secondaryButtonText = "Cancel",
  onPrimary,
  onSecondary,
  icon,
  loading = false,
}: ConfirmationModalProps) {
  const handlePrimary = () => {
    if (loading) return;
    if (onPrimary) {
      onPrimary();
    }
  };

  const handleSecondary = () => {
    if (loading) return;
    if (onSecondary) {
      onSecondary();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      radius="lg"
      padding="xl"
      overlayProps={{ opacity: 0.3, blur: 2 }}
    >
      <div className="flex flex-col items-center space-y-5 text-center">
        {/* Warning Icon */}
        <div className="flex items-center justify-center">
          {icon || (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0E5]">
              <Image
                src={exclamation}
                alt="Warning"
                width={40}
                height={40}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-body-heading-300!">
            {title}
        </h2>

        {/* Message */}
        <p className="px-4 text-sm text-body-text-100!">
          {message}
        </p>

        {/* Actions */}
        <div className="mt-2 w-full space-y-3">
          <Button
            fullWidth
            radius="xl"
            size="md"
            color="orange"
            onClick={handlePrimary}
            loading={loading}
            className="font-medium! text-sm!"
          >
            {primaryButtonText}
          </Button>

          {secondaryButtonText && (
            <Button
              fullWidth
              radius="xl"
              size="md"
              variant="outline"
              color="gray"
              onClick={handleSecondary}
              disabled={loading}
              className="border-text-50! border! font-semibold! text-sm!"
            >
              {secondaryButtonText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

