"use client";

import { useMemo, useState } from "react";
import { Modal, Button, Select, TextInput, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { z } from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type { NigerianBanksListResponse } from "@/app/_lib/api/types";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { useBankAccountLookup } from "@/app/(customer)/_hooks/use-bank-account-lookup";
import type { AddBankAccountInput } from "@/app/(customer)/_utils/customer-bank-accounts";
import { digitsFieldSchema, INPUT_LIMITS, sanitizeSearchQuery } from "@/app/_lib/input-field-rules";

const addBankSchema = z.object({
  bankName: z.string().min(1, "Select a bank"),
  accountNumber: digitsFieldSchema({
    label: "Account number",
    min: INPUT_LIMITS.ngnAccountNumber,
    max: INPUT_LIMITS.ngnAccountNumber,
    exact: INPUT_LIMITS.ngnAccountNumber,
  }),
  accountName: z.string().min(1, "Resolve account name before saving"),
});

export type AddBankAccountFormData = z.infer<typeof addBankSchema>;

interface AddBankAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onAddAccount: (data: AddBankAccountFormData) => void | Promise<void>;
  isSubmitting?: boolean;
}

const fieldInputClass =
  "!min-h-[56px] !rounded-lg !border-[#CCCACA] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] !text-base !text-[#4D4B4B] placeholder:!text-[#8F8B8B]";

export function AddBankAccountModal({
  opened,
  onClose,
  onAddAccount,
  isSubmitting = false,
}: Readonly<AddBankAccountModalProps>) {
  const [bankSearch, setBankSearch] = useState("");
  const [debouncedBankSearch] = useDebouncedValue(bankSearch, 300);
  const [formError, setFormError] = useState<string | null>(null);

  const lookup = useBankAccountLookup(opened);

  const { data: banksResponse, isLoading: banksLoading } = useFetchData<NigerianBanksListResponse>(
    [...customerKeys.bankAccounts.banks(debouncedBankSearch)],
    () =>
      customerApi.bankAccounts.listBanks({
        q: debouncedBankSearch.trim() || undefined,
      }),
    opened,
  );

  const bankSelectData = useMemo(() => {
    const banks = banksResponse?.data ?? [];
    return banks.map((bank) => ({
      value: bank.name,
      label: bank.name,
    }));
  }, [banksResponse?.data]);

  const validatePayload = (values: AddBankAccountInput): string | null => {
    const parsed = addBankSchema.safeParse(values);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? "Invalid bank account details.";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const values: AddBankAccountInput = {
      bankName: lookup.bankName.trim(),
      accountNumber: lookup.accountNumber,
      accountName: lookup.accountName.trim(),
    };

    const validationMessage = validatePayload(values);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    if (!lookup.isResolved) {
      setFormError("Resolve account name before saving.");
      return;
    }

    try {
      await onAddAccount(values as AddBankAccountFormData);
      lookup.resetLookup();
      setBankSearch("");
      onClose();
    } catch {
      // Parent shows API error; keep modal open.
    }
  };

  const handleClose = () => {
    lookup.resetLookup();
    setBankSearch("");
    setFormError(null);
    onClose();
  };

  const canSubmit = lookup.isResolved && !isSubmitting;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div>
          <h2 className="text-[#4D4B4B] font-bold text-xl leading-7">
            Add new account
          </h2>
          <p className="text-[#6C6969] font-normal text-base leading-6 mt-1">
            Select your bank, enter your account number, and we will verify the account name.
          </p>
        </div>
      }
      centered
      radius="xl"
      size="lg"
      classNames={{
        content: "!p-0 overflow-hidden",
        header: "!p-0 !mb-0",
        title: "!p-6 !pb-4 border-b border-gray-100",
        body: "!p-0",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col gap-6 px-6 py-6 overflow-y-auto max-h-[60vh]">
          <Select
            label="Select Bank"
            withAsterisk
            searchable
            clearable
            placeholder="Search or select bank"
            data={bankSelectData}
            size="md"
            value={lookup.bankName || null}
            onChange={(value) => lookup.setBankName(value ?? "")}
            searchValue={bankSearch}
            onSearchChange={(value) => setBankSearch(sanitizeSearchQuery(value))}
            nothingFoundMessage={banksLoading ? "Loading banks…" : "No banks found"}
            rightSection={
              banksLoading ? (
                <Loader size="xs" />
              ) : (
                <HugeiconsIcon icon={ChevronDown} size={20} className="text-[#B2AFAF]" />
              )
            }
            classNames={{ input: fieldInputClass }}
          />

          <TextInput
            label="Account Number"
            withAsterisk
            placeholder="Enter 10-digit account number"
            size="md"
            maxLength={lookup.accountNumberLength}
            inputMode="numeric"
            value={lookup.accountNumber}
            error={lookup.lookupError ?? formError ?? undefined}
            rightSection={lookup.lookupLoading ? <Loader size="xs" /> : null}
            onChange={(e) => lookup.setAccountNumberDigits(e.currentTarget.value)}
            classNames={{ input: fieldInputClass }}
          />

          <TextInput
            label="Account Name"
            readOnly
            placeholder={lookup.lookupLoading ? "Resolving name…" : "Resolved from bank"}
            size="md"
            value={lookup.accountName}
            classNames={{
              input: `${fieldInputClass} !bg-[#F9F9F9]`,
            }}
          />
        </div>

        <div className="flex gap-4 px-6 py-6 bg-[#FFFAF8] justify-end">
          <Button
            type="button"
            variant="outline"
            radius="xl"
            className="min-w-[200px]! min-h-[52px]! py-3.5! px-6! bg-[#FFF6F1]! border-primary-200! text-primary-300! font-medium! text-base! hover:bg-[#FFEDE5]! hover:border-primary-200!"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            radius="xl"
            loading={isSubmitting}
            disabled={!canSubmit}
            className="min-w-[200px]! min-h-[52px]! py-3.5! px-6! bg-primary-400! hover:bg-[#C74704]! text-[#FFF6F1]! font-medium! text-base!"
          >
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
