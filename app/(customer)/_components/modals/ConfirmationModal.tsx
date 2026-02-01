"use client";

import { Modal } from "@mantine/core";
import { Button } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "warning" | "info" | "danger";
}

export function ConfirmationModal({
  opened,
  onClose,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "No, Close",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmationModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const iconBgColor =
    variant === "warning"
      ? "bg-warning-50"
      : variant === "danger"
        ? "bg-error-50"
        : "bg-[#F8DCCD]";

  const iconColor =
    variant === "warning"
      ? "text-warning-700"
      : variant === "danger"
        ? "text-error-500"
        : "text-primary-400";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      radius="xl"
      size="sm"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        <div
          className={`${iconBgColor} flex flex-row items-center justify-center w-20 h-20 p-4 rounded-full flex-none shrink-0`}
        >
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={48}
            className={iconColor}
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-body-heading-300 text-lg font-semibold">
            {title}
          </h2>
          <p className="text-body-text-200 text-sm">{description}</p>
        </div>

        <div className="flex flex-col items-stretch gap-4 w-full">
          <Button
            onClick={onConfirm}
            variant="filled"
            fullWidth
            radius="xl"
            className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6"
          >
            {confirmLabel}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            fullWidth
            radius="xl"
            className="h-[52px] min-h-[52px] py-3.5 px-6 bg-white border border-[#CCCACA] text-[#4D4B4B] font-medium text-base leading-6 hover:bg-gray-50"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
