"use client";

import { useState, useCallback } from "react";
import PickupPointStep, {
  type PickupOrBankFormData,
  type BankAccount,
} from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";

export type ResidentPickupPointFormData = PickupOrBankFormData;

interface ResidentPickupPointStepProps {
  initialValues?: Partial<ResidentPickupPointFormData>;
  onSubmit: (data: ResidentPickupPointFormData) => void;
  onBack?: () => void;
}

function createBankId() {
  return `bank-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ResidentPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
}: ResidentPickupPointStepProps) {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [addBankOpened, setAddBankOpened] = useState(false);

  const handleAddBank = useCallback((data: AddBankAccountFormData) => {
    setBanks((prev) => [
      ...prev,
      {
        id: createBankId(),
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: "ADEOLA ADERINSOLA", // Placeholder; in production resolve from account number or form
      },
    ]);
  }, []);

  return (
    <>
      <PickupPointStep
        preferenceMode="pickup-or-bank"
        subtitle="Select the closest sohcahtoa office to pick up your card and cash"
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
