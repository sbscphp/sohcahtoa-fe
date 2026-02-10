"use client";

import { Modal, Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { successGif } from "@/app/assets/asset";

interface ResubmitSuccessModalProps {
  opened: boolean;
  onClose: () => void;
  /** Transaction type label from API (e.g. "BTA", "Personal Travel Allowance (PTA)") – used in title and message */
  transactionTypeLabel: string;
  onViewTransaction: () => void;
}

/** Success modal after resubmitting documents. Title: "[Transaction type] Resubmitted Successfully". */
export default function ResubmitSuccessModal({
  opened,
  onClose,
  transactionTypeLabel,
  onViewTransaction,
}: ResubmitSuccessModalProps) {
  const shortLabel = transactionTypeLabel.replace(/\s*\([^)]*\)\s*$/, "").trim() || transactionTypeLabel;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      centered
      withCloseButton={false}
      radius="lg"
      size="sm"
    >
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#ECFDF3] border-4 border-[#027A48] flex items-center justify-center relative overflow-hidden">
            <Image src={successGif} alt="Success" width={80} height={80} className="object-contain" />
          </div>
        </div>

        <h2 className="text-[#131212] text-xl font-semibold leading-7">
          {shortLabel} Resubmitted Successfully
        </h2>

        <p className="text-[#6C6969] text-base leading-6">
          You have successfully resubmitted your {shortLabel}. Your documents have been received and currently awaiting approval.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onViewTransaction}
            variant="filled"
            fullWidth
            radius="xl"
            className="h-12 bg-[#DD4F05] hover:bg-[#B84204] text-white font-medium text-base"
            rightSection={<ArrowUpRight size={18} />}
          >
            View Transaction
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            fullWidth
            radius="xl"
            className="h-12 bg-white border border-gray-300 text-[#4D4B4B] font-medium text-base hover:bg-gray-50"
          >
            No, Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
