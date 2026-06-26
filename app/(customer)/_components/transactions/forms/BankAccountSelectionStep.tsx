"use client";

import { Button, Alert } from "@mantine/core";
import { Info } from "lucide-react";
import { useState } from "react";
import { BankAccountsList } from "@/app/(customer)/_components/bank-accounts/BankAccountsList";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { REFUND_BANK_ACCOUNT_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";

export type BankAccountSelectionPurpose = "payout" | "refund";

interface BankAccountSelectionStepProps {
  banks: BankAccount[];
  isLoading?: boolean;
  initialSelectedBankId?: string;
  onSubmit: (bank: BankAccount) => void;
  onBack?: () => void;
  onAddBank: () => void;
  purpose?: BankAccountSelectionPurpose;
}

const PURPOSE_COPY: Record<
  BankAccountSelectionPurpose,
  { title: string; subtitle: string; showRefundNotice: boolean }
> = {
  payout: {
    title: "Select Bank Account",
    subtitle: "Select an account to receive the electronic transfer or add a new one.",
    showRefundNotice: false,
  },
  refund: {
    title: "Refund Bank Details",
    subtitle: "Select your local Nigerian bank account for refunds if your transaction cannot be processed.",
    showRefundNotice: true,
  },
};

export default function BankAccountSelectionStep({
  banks,
  isLoading = false,
  initialSelectedBankId,
  onSubmit,
  onBack,
  onAddBank,
  purpose = "payout",
}: Readonly<BankAccountSelectionStepProps>) {
  const [selectedBankId, setSelectedBankId] = useState(initialSelectedBankId ?? "");
  const selectedBank = banks.find((bank) => bank.id === selectedBankId);
  const copy = PURPOSE_COPY[purpose];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">{copy.title}</h2>
        <p className="text-body-text-200 text-base max-w-md text-center">{copy.subtitle}</p>
      </div>

      {copy.showRefundNotice && (
        <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
          <p className="text-body-text-200 text-sm">{REFUND_BANK_ACCOUNT_MESSAGE}</p>
        </Alert>
      )}

      <BankAccountsList
        accounts={banks}
        isLoading={isLoading}
        searchable
        selectedId={selectedBankId}
        onSelect={setSelectedBankId}
        onAddBank={onAddBank}
        selectionError={
          !selectedBankId && banks.length > 0 ? "Please select a bank account" : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center w-full">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="xl"
            className="border-gray-200! text-body-text-200! w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          variant="filled"
          size="md"
          radius="xl"
          disabled={!selectedBank}
          className="w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
          onClick={() => selectedBank && onSubmit(selectedBank)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
