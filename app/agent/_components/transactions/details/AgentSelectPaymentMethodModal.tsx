"use client";

import { Button, Modal } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";

type AgentPaymentMethod = "cash" | "bank_transfer";

interface AgentSelectPaymentMethodModalProps {
  opened: boolean;
  onClose: () => void;
  paymentMethod: AgentPaymentMethod;
  onPaymentMethodChange: (method: AgentPaymentMethod) => void;
  onContinue: () => void;
}

export default function AgentSelectPaymentMethodModal({
  opened,
  onClose,
  paymentMethod,
  onPaymentMethodChange,
  onContinue,
}: Readonly<AgentSelectPaymentMethodModalProps>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      withCloseButton={false}
      title={
        <div className="space-y-1">
          <h4 className="text-[#323131] text-lg font-bold leading-7">Select Payment Method</h4>
          <p className="text-[#6C6969] text-base font-normal leading-6">
            Kindly select your preferred payment method below to continue
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onPaymentMethodChange("cash")}
          className={`w-full rounded-lg border px-4 py-4 text-left text-sm font-medium transition-colors ${
            paymentMethod === "cash"
              ? "bg-[#FFF6F1] border-[#DD4F05] text-[#4D4B4B]"
              : "bg-white border-[#E1E0E0] text-[#4D4B4B] hover:bg-[#FAFAFA]"
          }`}
        >
          Cash
        </button>
        <button
          type="button"
          onClick={() => onPaymentMethodChange("bank_transfer")}
          className={`w-full rounded-lg border px-4 py-4 text-left text-sm font-medium transition-colors ${
            paymentMethod === "bank_transfer"
              ? "bg-[#FFF6F1] border-[#DD4F05] text-[#4D4B4B]"
              : "bg-white border-[#E1E0E0] text-[#4D4B4B] hover:bg-[#FAFAFA]"
          }`}
        >
          Bank Transfer
        </button>
        <Button
          radius="xl"
          fullWidth
          className="mt-2! bg-[#DD4F05] hover:bg-[#B84204] text-[#FFF6F1] h-12!"
          onClick={onContinue}
          rightSection={<ArrowUpRight className="w-4 h-4" />}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
}
