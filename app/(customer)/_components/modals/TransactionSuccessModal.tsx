"use client";

import { Modal, Button } from "@mantine/core";
import { Check } from "lucide-react";

interface TransactionSuccessModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function TransactionSuccessModal({
  opened,
  onClose,
  title = "Transaction Completed Successfully",
  description = "Your IMTO transaction has been successfully processed and your payment has been confirmed. You will receive a notification once your funds are available for collection or transfer.",
  confirmLabel = "View Transaction",
  onConfirm,
}: TransactionSuccessModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      radius="xl"
      size="sm"
      classNames={{ content: "bg-white" }}
    >
      <div className="flex flex-col items-center text-center space-y-6 py-2">
        {/* Success icon: green circle + checkmark + dashed burst */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-success-500/60"
            style={{ width: 88, height: 88, margin: "auto" }}
            aria-hidden
          />
          <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center flex-none shrink-0">
            <Check size={40} strokeWidth={3} className="text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-body-heading-300 text-xl font-bold">
            {title}
          </h2>
          <p className="text-body-text-200 text-sm font-normal leading-5 max-w-sm mx-auto">
            {description}
          </p>
        </div>

        <Button
          onClick={onConfirm}
          variant="filled"
          fullWidth
          radius="xl"
          className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-white font-medium text-base leading-6"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
