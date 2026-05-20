"use client";

import { useState, useCallback } from "react";
import PickupPointStep, {
  type PickupOrBankFormData,
} from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import { useCustomerBankAccounts } from "@/app/(customer)/_hooks/use-customer-bank-accounts";
import { toCreateBankAccountPayload } from "@/app/(customer)/_utils/customer-bank-accounts";
import { handleApiError } from "@/app/_lib/api/error-handler";

export type ResidentPickupPointFormData = PickupOrBankFormData;

interface ResidentPickupPointStepProps {
  initialValues?: Partial<ResidentPickupPointFormData>;
  onSubmit: (data: ResidentPickupPointFormData) => void;
  onBack?: () => void;
}

export default function ResidentPickupPointStep({
  initialValues,
  onSubmit,
  onBack,
}: ResidentPickupPointStepProps) {
  const [addBankOpened, setAddBankOpened] = useState(false);
  const { accounts: banks, isLoading: banksLoading, addAccount, isSaving } =
    useCustomerBankAccounts();

  const handleAddBank = useCallback(
    async (data: AddBankAccountFormData) => {
      try {
        await addAccount(toCreateBankAccountPayload(data));
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    [addAccount],
  );

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
        banksLoading={banksLoading}
        onAddBank={() => setAddBankOpened(true)}
      />
      <AddBankAccountModal
        opened={addBankOpened}
        onClose={() => setAddBankOpened(false)}
        onAddAccount={handleAddBank}
        isSubmitting={isSaving}
      />
    </>
  );
}
