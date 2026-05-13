"use client";

import { Button, Text } from "@mantine/core";
import { useState } from "react";
import { EmptyState } from "@/app/(customer)/_components/common";
import SelectableBankCard from "@/app/(customer)/_components/forms/SelectableBankCard";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";

interface BankAccountSelectionStepProps {
  banks: BankAccount[];
  initialSelectedBankId?: string;
  onSubmit: (bank: BankAccount) => void;
  onBack?: () => void;
  onAddBank: () => void;
}

export default function BankAccountSelectionStep({
  banks,
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

      <div className="box-border flex flex-col items-start p-4 gap-6 w-full bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
        <p className="text-body-text-200 text-base font-normal leading-6 flex-none">
          Bank Accounts ({banks.length.toString().padStart(2, "0")})
        </p>
        <div className="flex flex-col items-start w-full gap-4 max-h-[240px] overflow-y-auto">
          {banks.length === 0 ? (
            <EmptyState
              title="No Data available"
              description="Add a bank account to receive your funds"
              className="w-full py-4"
            />
          ) : (
            banks.map((bank) => (
              <SelectableBankCard
                key={bank.id}
                bankName={bank.bankName}
                accountNumber={bank.accountNumber}
                accountName={bank.accountName}
                isSelected={selectedBankId === bank.id}
                onClick={() => setSelectedBankId(bank.id)}
              />
            ))
          )}
        </div>
        <button
          type="button"
          onClick={onAddBank}
          className="flex items-center gap-2 text-primary-400 font-medium text-sm hover:underline"
        >
          <span className="text-lg leading-none">+</span> Add New Bank
        </button>
        {!selectedBankId && banks.length > 0 ? (
          <Text size="sm" c="red" className="w-full">
            Please select a bank account
          </Text>
        ) : null}
      </div>

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
