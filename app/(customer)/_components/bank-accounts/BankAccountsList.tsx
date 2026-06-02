"use client";

import { useMemo, useState } from "react";
import { Loader, Text, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import { EmptyState } from "@/app/(customer)/_components/common";
import SelectableBankCard from "@/app/(customer)/_components/forms/SelectableBankCard";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { filterBankAccounts } from "@/app/(customer)/_utils/customer-bank-accounts";

interface BankAccountsListProps {
  accounts: BankAccount[];
  isLoading?: boolean;
  /** Selection mode (transaction flows). */
  selectedId?: string;
  onSelect?: (accountId: string) => void;
  onAddBank?: () => void;
  addBankLabel?: string;
  countLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  maxHeightClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectionError?: string;
  /** Settings / management: show default badge and actions below cards. */
  defaultAccountId?: string;
  onSetDefault?: (accountId: string) => void;
  onRemove?: (accountId: string) => void;
  settingDefaultId?: string | null;
  removingId?: string | null;
}

export function BankAccountsList({
  accounts,
  isLoading = false,
  selectedId,
  onSelect,
  onAddBank,
  addBankLabel = "Add New Bank",
  countLabel = "Bank Accounts",
  emptyTitle = "No accounts yet",
  emptyDescription = "Add a bank account to receive your funds",
  maxHeightClassName = "max-h-[240px]",
  searchable = false,
  searchPlaceholder = "Search by bank, account number, or name",
  selectionError,
  defaultAccountId,
  onSetDefault,
  onRemove,
  settingDefaultId = null,
  removingId = null,
}: Readonly<BankAccountsListProps>) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => filterBankAccounts(accounts, search),
    [accounts, search],
  );
  const isManageMode = Boolean(onSetDefault || onRemove);

  return (
    <div className="box-border flex w-full flex-col items-start gap-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-normal leading-6 text-body-text-200">
          {countLabel} ({accounts.length.toString().padStart(2, "0")})
        </p>
        {searchable ? (
          <TextInput
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<Search size={16} className="text-primary-400" />}
            size="sm"
            radius="xl"
            className="w-full sm:max-w-xs"
            classNames={{
              input:
                "!rounded-full !border-[#CCCACA] !text-sm !text-[#4D4B4B] placeholder:!text-[#8F8B8B]",
            }}
          />
        ) : null}
      </div>

      <div
        className={`flex w-full flex-col items-start gap-4 overflow-y-auto ${maxHeightClassName}`}
      >
        {isLoading ? (
          <div className="flex w-full items-center justify-center py-10">
            <Loader size="sm" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={accounts.length === 0 ? emptyTitle : "No matching accounts"}
            description={
              accounts.length === 0
                ? emptyDescription
                : "Try a different search term"
            }
            className="w-full py-4"
          />
        ) : (
          filtered.map((bank) => {
            const isDefault = defaultAccountId === bank.id;
            if (!isManageMode) {
              return (
                <SelectableBankCard
                  key={bank.id}
                  bankName={bank.bankName}
                  accountNumber={bank.accountNumber}
                  accountName={bank.accountName}
                  isSelected={selectedId === bank.id}
                  onClick={() => onSelect?.(bank.id)}
                />
              );
            }

            return (
              <div key={bank.id} className="flex w-full flex-col gap-2">
                <div className="relative w-full">
                  <SelectableBankCard
                    bankName={bank.bankName}
                    accountNumber={bank.accountNumber}
                    accountName={bank.accountName}
                    isSelected={false}
                    readOnly
                  />
                  {isDefault ? (
                    <span className="absolute right-3 top-3 rounded-full bg-primary-25 px-2.5 py-0.5 text-xs font-medium text-primary-400">
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 pl-14">
                  {!isDefault && onSetDefault ? (
                    <button
                      type="button"
                      disabled={settingDefaultId === bank.id}
                      className="text-sm font-medium text-primary-400 hover:underline disabled:opacity-50"
                      onClick={() => onSetDefault(bank.id)}
                    >
                      {settingDefaultId === bank.id ? "Setting…" : "Set as default"}
                    </button>
                  ) : null}
                  {onRemove ? (
                    <button
                      type="button"
                      disabled={removingId === bank.id}
                      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                      onClick={() => onRemove(bank.id)}
                    >
                      {removingId === bank.id ? "Removing…" : "Remove"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {onAddBank ? (
        <button
          type="button"
          onClick={onAddBank}
          className="flex items-center gap-2 text-sm font-medium text-primary-400 hover:underline"
        >
          <span className="text-lg leading-none">+</span> {addBankLabel}
        </button>
      ) : null}

      {selectionError ? (
        <Text size="sm" c="red" className="w-full">
          {selectionError}
        </Text>
      ) : null}
    </div>
  );
}
