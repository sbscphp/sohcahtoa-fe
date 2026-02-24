"use client";

import { useState } from "react";
import { Modal, Button, Checkbox } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { CONFIRM_INFO_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";

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
  /** When true, user must check "I confirm that the information I have provided is correct" before continuing. */
  requireInfoConfirmation?: boolean;
  /** Show loading state on confirm button */
  loading?: boolean;
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
  requireInfoConfirmation = false,
  loading = false,
}: ConfirmationModalProps) {
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setInfoConfirmed(false);
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

  const canConfirm = !requireInfoConfirmation || infoConfirmed;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        handleOpenChange(false);
        onClose();
      }}
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

        {requireInfoConfirmation && (
          <Checkbox
            checked={infoConfirmed}
            onChange={(e) => setInfoConfirmed(e.currentTarget.checked)}
            label={CONFIRM_INFO_MESSAGE}
            className="w-full"
            size="md"
          />
        )}

        <div className="flex flex-col items-stretch gap-4 w-full">
          <Button
            onClick={onConfirm}
            variant="filled"
            fullWidth
            radius="xl"
            disabled={!canConfirm || loading}
            loading={loading}
            className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6 disabled:opacity-50"
          >
            {confirmLabel}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            fullWidth
            radius="xl"
            disabled={loading}
            className="h-[52px] min-h-[52px] py-3.5 px-6 bg-white border border-[#CCCACA] text-[#4D4B4B] font-medium text-base leading-6 hover:bg-gray-50"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
