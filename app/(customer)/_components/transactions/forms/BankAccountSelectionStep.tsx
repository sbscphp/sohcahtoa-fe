"use client";

import { Button } from "@mantine/core";
import { useState } from "react";
import { BankAccountsList } from "@/app/(customer)/_components/bank-accounts/BankAccountsList";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";

interface BankAccountSelectionStepProps {
  banks: BankAccount[];
  isLoading?: boolean;
  initialSelectedBankId?: string;
  onSubmit: (bank: BankAccount) => void;
  onBack?: () => void;
  onAddBank: () => void;
}

export default function BankAccountSelectionStep({
  banks,
  isLoading = false,
  initialSelectedBankId,
  onSubmit,
  onBack,
  onAddBank,
}: Readonly<BankAccountSelectionStepProps>) {
  const [selectedBankId, setSelectedBankId] = useState(initialSelectedBankId ?? "");
  const selectedBank = banks.find((bank) => bank.id === selectedBankId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Select Bank Account
        </h2>
        <p className="text-body-text-200 text-base max-w-md text-center">
          Select an account to receive the electronic transfer or add a new one.
        </p>
      </div>

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
