"use client";

import { useState, useCallback } from "react";
import { Alert } from "@mantine/core";
import { Info } from "lucide-react";
import PickupPointStep, {
  type PickupOrBankFormData,
} from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import { useCustomerBankAccounts } from "@/app/(customer)/_hooks/use-customer-bank-accounts";
import { toCreateBankAccountPayload } from "@/app/(customer)/_utils/customer-bank-accounts";
import { handleApiError } from "@/app/_lib/api/error-handler";

export type SellFxPayoutPointFormData = PickupOrBankFormData;

interface SellFxPayoutPointStepProps {
  initialValues?: Partial<SellFxPayoutPointFormData>;
  onSubmit: (data: SellFxPayoutPointFormData) => void;
  onBack?: () => void;
}

/** Shared payout step for Resident and Expatriate Sell FX (no cash pickup). */
export default function SellFxPayoutPointStep({
  initialValues,
  onSubmit,
  onBack,
}: Readonly<SellFxPayoutPointStepProps>) {
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
        title="Choose a Payout Method"
        subtitle="Select an option below"
        preferenceLabels={{
          pickup: "Prepaid NGN Card",
          bank: "Electronic Transfer",
        }}
        submitLabel="Save"
        initialValues={initialValues}
        onSubmit={onSubmit as (data: PickupOrBankFormData) => void}
        onBack={onBack}
        banks={banks}
        banksLoading={banksLoading}
        onAddBank={() => setAddBankOpened(true)}
        preferenceNotice={
          <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
            <p className="text-body-text-200 text-sm">
              Electronic transfer is to a Naira account. Cash pickup is not allowed.
            </p>
          </Alert>
        }
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
