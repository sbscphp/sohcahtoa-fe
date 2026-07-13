"use client";

import { Button, Alert } from "@mantine/core";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BankAccountsList } from "@/app/(customer)/_components/bank-accounts/BankAccountsList";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { SELL_REFUND_DOMICILIARY_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import type { DomiciliaryAccountFormData } from "@/app/(customer)/_lib/domiciliary-account-schema";
import { isCompleteDomiciliaryRefundAccount } from "@/app/(customer)/_utils/customer-bank-accounts";

/** Local (unsaved) or API-mapped domiciliary refund account. */
export type DomiciliaryRefundAccount = DomiciliaryAccountFormData & { id: string };

interface DomiciliaryRefundBankStepProps {
  accounts: DomiciliaryRefundAccount[];
  isLoading?: boolean;
  initialSelectedAccountId?: string;
  onSubmit: (account: DomiciliaryRefundAccount) => void;
  onBack?: () => void;
  onAddAccount: () => void;
}

function toListAccount(account: DomiciliaryRefundAccount): BankAccount {
  return {
    id: account.id,
    bankName: account.domiciliaryBankName,
    accountNumber: account.domiciliaryAccountNumber,
    accountName: account.accountName,
  };
}

export default function DomiciliaryRefundBankStep({
  accounts,
  isLoading = false,
  initialSelectedAccountId,
  onSubmit,
  onBack,
  onAddAccount,
}: Readonly<DomiciliaryRefundBankStepProps>) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialSelectedAccountId ?? "",
  );

  useEffect(() => {
    if (initialSelectedAccountId) {
      setSelectedAccountId(initialSelectedAccountId);
    }
  }, [initialSelectedAccountId]);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);
  const canProceed = Boolean(
    selectedAccount && isCompleteDomiciliaryRefundAccount(selectedAccount),
  );
  const listAccounts = useMemo(() => accounts.map(toListAccount), [accounts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">Refund Bank Details</h2>
        <p className="text-body-text-200 text-base max-w-md text-center">
          Select your domiciliary (foreign currency) bank account for refunds if your transaction
          cannot be processed.
        </p>
      </div>

      <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
        <p className="text-body-text-200 text-sm">{SELL_REFUND_DOMICILIARY_MESSAGE}</p>
      </Alert>

      <BankAccountsList
        accounts={listAccounts}
        isLoading={isLoading}
        searchable
        selectedId={selectedAccountId}
        onSelect={setSelectedAccountId}
        onAddBank={onAddAccount}
        addBankLabel="Add New Bank"
        emptyTitle="No domiciliary accounts yet"
        emptyDescription="Add a domiciliary account for refunds"
        selectionError={
          selectedAccount && !isCompleteDomiciliaryRefundAccount(selectedAccount)
            ? "This account is missing details. Add a complete domiciliary account to continue."
            : !selectedAccountId && accounts.length > 0
              ? "Please select a domiciliary bank account"
              : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center w-full">
        {onBack ? (
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
        ) : null}
        <Button
          type="button"
          variant="filled"
          size="md"
          radius="xl"
          disabled={!canProceed}
          className="w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
          onClick={() => selectedAccount && canProceed && onSubmit(selectedAccount)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
