"use client";

import { useMemo, useState } from "react";
import { Button, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Plus } from "lucide-react";
import { BankAccountsList } from "@/app/(customer)/_components/bank-accounts/BankAccountsList";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { useLocalBankAccounts } from "@/app/(customer)/_hooks/use-customer-bank-accounts";
import { toCreateBankAccountPayload } from "@/app/(customer)/_utils/customer-bank-accounts";
import { handleApiError } from "@/app/_lib/api/error-handler";

export function BankAccountsManager() {
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const {
    savedAccounts,
    accounts,
    isLoading,
    addAccount,
    isSaving,
    setDefaultAccount,
    removeAccount,
  } = useLocalBankAccounts();

  const defaultAccountId = useMemo(
    () => savedAccounts.find((a) => a.isDefault)?.id,
    [savedAccounts],
  );

  const removeTarget = savedAccounts.find((a) => a.id === removeTargetId);

  const handleAddAccount = async (data: AddBankAccountFormData) => {
    try {
      await addAccount(toCreateBankAccountPayload(data));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  const handleSetDefault = async (bankAccountId: string) => {
    setSettingDefaultId(bankAccountId);
    try {
      await setDefaultAccount(bankAccountId);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeTargetId) return;
    setRemovingId(removeTargetId);
    try {
      await removeAccount(removeTargetId);
      setRemoveTargetId(null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div
        className="flex flex-col rounded-2xl bg-white"
        style={{
          border: "1.5px solid #F2F4F7",
          boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
        }}
      >
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-medium leading-8 tracking-[-0.032em] text-[#131212]">
              Bank accounts
            </h2>
            <p className="text-base font-normal leading-6 text-[#6C6969]">
              Save accounts for electronic transfers. Names are verified with your bank.
            </p>
          </div>
          <Button
            radius="xl"
            leftSection={<Plus size={18} />}
            className="h-[48px]! bg-primary-400! px-5! text-base font-medium text-[#FFF6F1]! hover:bg-[#C74704]!"
            onClick={openAdd}
          >
            Add account
          </Button>
        </div>

        <div className="px-6 py-6 sm:px-8 md:px-10">
          {isLoading && accounts.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader size="md" />
            </div>
          ) : (
            <BankAccountsList
              accounts={accounts}
              isLoading={isLoading}
              searchable
              countLabel="Saved accounts"
              emptyTitle="No bank accounts yet"
              emptyDescription="Add an account to use it for electronic transfer payouts"
              maxHeightClassName="max-h-[420px]"
              defaultAccountId={defaultAccountId}
              onSetDefault={handleSetDefault}
              onRemove={setRemoveTargetId}
              settingDefaultId={settingDefaultId}
              removingId={removingId}
              onAddBank={openAdd}
              addBankLabel="Add another account"
            />
          )}
        </div>
      </div>

      <AddBankAccountModal
        opened={addOpened}
        onClose={closeAdd}
        onAddAccount={handleAddAccount}
        isSubmitting={isSaving}
      />

      <ConfirmationModal
        opened={Boolean(removeTargetId)}
        onClose={() => setRemoveTargetId(null)}
        title="Remove bank account?"
        description={
          removeTarget
            ? `Remove ${removeTarget.bankName} (${removeTarget.accountNumber}) from your saved accounts?`
            : "Remove this account from your saved accounts?"
        }
        confirmLabel="Yes, remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={Boolean(removingId)}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
