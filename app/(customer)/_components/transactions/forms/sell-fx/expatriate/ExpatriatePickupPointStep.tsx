"use client";

import { useState, useCallback } from "react";
import PickupPointStep, {
  type PickupOrBankFormData,
  type BankAccount,
} from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";

export type ExpatriatePickupPointFormData = PickupOrBankFormData;

interface ExpatriatePickupPointStepProps {
  initialValues?: Partial<ExpatriatePickupPointFormData>;
  onSubmit: (data: ExpatriatePickupPointFormData) => void;
  onBack?: () => void;
}

function createBankId() {
  return `bank-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ExpatriatePickupPointStep({
  initialValues,
  onSubmit,
  onBack,
}: ExpatriatePickupPointStepProps) {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [addBankOpened, setAddBankOpened] = useState(false);

  const handleAddBank = useCallback((data: AddBankAccountFormData) => {
    setBanks((prev) => [
      ...prev,
      {
        id: createBankId(),
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: "ADEOLA ADERINSOLA",
      },
    ]);
  }, []);

  return (
    <>
      <PickupPointStep
        preferenceMode="pickup-or-bank"
        title="How would you like to receive your funds?"
        subtitle="Select an option and fill the required details on each option."
        submitLabel="Save"
        initialValues={initialValues}
        onSubmit={onSubmit as (data: PickupOrBankFormData) => void}
        onBack={onBack}
        banks={banks}
        onAddBank={() => setAddBankOpened(true)}
      />
      <AddBankAccountModal
        opened={addBankOpened}
        onClose={() => setAddBankOpened(false)}
        onAddAccount={handleAddBank}
      />
    </>
  );
}
