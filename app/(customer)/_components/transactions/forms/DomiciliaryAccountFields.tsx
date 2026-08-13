"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Alert, Loader, Select, TextInput, Textarea } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Info } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { DOMICILIARY_ACCOUNT_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import {
  DOMICILIARY_INPUT_LIMITS,
  sanitizeDomiciliaryAccountName,
  sanitizeDomiciliaryAccountNumber,
  sanitizeDomiciliaryBankAddress,
  sanitizeDomiciliaryIban,
  sanitizeDomiciliaryRoutingNumber,
  sanitizeDomiciliarySwiftCode,
} from "@/app/(customer)/_lib/domiciliary-account-schema";
import { bindSanitizedInput, sanitizeSearchQuery } from "@/app/_lib/input-field-rules";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type { NigerianBanksListResponse } from "@/app/_lib/api/types";
import { customerApi } from "@/app/(customer)/_services/customer-api";

type DomiciliaryFieldName =
  | "domiciliaryAccountNumber"
  | "domiciliaryBankName"
  | "accountName"
  | "swiftCode"
  | "iban"
  | "routingNumber"
  | "bankAddress";

type DomiciliaryAccountFieldsProps = {
  getInputProps: (field: DomiciliaryFieldName) => object;
  setFieldValue: (field: DomiciliaryFieldName, value: string) => void;
  clearFieldError?: (field: DomiciliaryFieldName) => void;
  errors?: Partial<Record<DomiciliaryFieldName, ReactNode>>;
  /** When false, skips the default payout info alert (caller may show its own). */
  showInfoAlert?: boolean;
  /** Current bank name — needed so Select stays controlled when getInputProps is uncontrolled. */
  bankNameValue?: string;
};

export default function DomiciliaryAccountFields({
  getInputProps,
  setFieldValue,
  clearFieldError,
  errors = {},
  showInfoAlert = true,
  bankNameValue,
}: Readonly<DomiciliaryAccountFieldsProps>) {
  const afterSanitize = (field: DomiciliaryFieldName) => () => clearFieldError?.(field);
  const [bankSearch, setBankSearch] = useState("");
  const [debouncedBankSearch] = useDebouncedValue(bankSearch, 300);

  const bankInputProps = getInputProps("domiciliaryBankName") as {
    value?: string;
    defaultValue?: string;
  };
  const selectedBankName =
    bankNameValue ?? bankInputProps.value ?? bankInputProps.defaultValue ?? "";

  const { data: banksResponse, isLoading: banksLoading } = useFetchData<NigerianBanksListResponse>(
    [...customerKeys.bankAccounts.banks(debouncedBankSearch)],
    () =>
      customerApi.bankAccounts.listBanks({
        q: debouncedBankSearch.trim() || undefined,
      }),
    true
  );

  const bankSelectData = useMemo(() => {
    const banks = banksResponse?.data ?? [];
    const options = banks.map((bank) => ({
      value: bank.name,
      label: bank.name,
    }));
    if (
      selectedBankName &&
      !options.some((option) => option.value === selectedBankName)
    ) {
      options.unshift({ value: selectedBankName, label: selectedBankName });
    }
    return options;
  }, [banksResponse?.data, selectedBankName]);

  return (
    <div className="space-y-4">
      {showInfoAlert ? (
        <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
          <p className="text-body-text-200 text-sm">{DOMICILIARY_ACCOUNT_MESSAGE}</p>
        </Alert>
      ) : null}

      <TextInput
        label="Domiciliary Account Number"
        placeholder="Enter 10-digit account number"
        required
        size="md"
        {...getInputProps("domiciliaryAccountNumber")}
        {...bindSanitizedInput(
          sanitizeDomiciliaryAccountNumber,
          (value) => setFieldValue("domiciliaryAccountNumber", value),
          DOMICILIARY_INPUT_LIMITS.ngnAccountNumber,
          "numeric",
          afterSanitize("domiciliaryAccountNumber")
        )}
        error={errors.domiciliaryAccountNumber}
      />
      <Select
        label="Domiciliary Bank Name"
        placeholder="Search or select bank"
        required
        size="md"
        searchable
        clearable
        data={bankSelectData}
        value={selectedBankName || null}
        onChange={(value) => {
          setFieldValue("domiciliaryBankName", value ?? "");
          clearFieldError?.("domiciliaryBankName");
        }}
        searchValue={bankSearch}
        onSearchChange={(value) => setBankSearch(sanitizeSearchQuery(value))}
        nothingFoundMessage={banksLoading ? "Loading banks…" : "No banks found"}
        rightSection={
          banksLoading ? (
            <Loader size="xs" />
          ) : (
            <HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300!" />
          )
        }
        error={errors.domiciliaryBankName}
      />
      <TextInput
        label="Account Name"
        placeholder="Enter account name"
        required
        size="md"
        {...getInputProps("accountName")}
        {...bindSanitizedInput(
          sanitizeDomiciliaryAccountName,
          (value) => setFieldValue("accountName", value),
          DOMICILIARY_INPUT_LIMITS.personName,
          undefined,
          afterSanitize("accountName")
        )}
        error={errors.accountName}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="SWIFT Code"
          placeholder="Enter SWIFT / BIC"
          required
          size="md"
          {...getInputProps("swiftCode")}
          {...bindSanitizedInput(
            sanitizeDomiciliarySwiftCode,
            (value) => setFieldValue("swiftCode", value),
            DOMICILIARY_INPUT_LIMITS.swiftCode,
            undefined,
            afterSanitize("swiftCode")
          )}
          error={errors.swiftCode}
        />
        <TextInput
          label="IBAN"
          placeholder="e.g. GB29NWBK60161331926819"
          // description="Optional — include if your bank uses IBAN"
          size="md"
          {...getInputProps("iban")}
          {...bindSanitizedInput(
            sanitizeDomiciliaryIban,
            (value) => setFieldValue("iban", value),
            DOMICILIARY_INPUT_LIMITS.iban,
            undefined,
            afterSanitize("iban")
          )}
          error={errors.iban}
        />
      </div>
      <TextInput
        label="Routing Number"
        placeholder="Enter routing number"
        required
        size="md"
        {...getInputProps("routingNumber")}
        {...bindSanitizedInput(
          sanitizeDomiciliaryRoutingNumber,
          (value) => setFieldValue("routingNumber", value),
          DOMICILIARY_INPUT_LIMITS.routingNumberGeneric,
          "numeric",
          afterSanitize("routingNumber")
        )}
        error={errors.routingNumber}
      />
      <Textarea
        label="Bank Address"
        placeholder="Enter bank address"
        required
        size="md"
        minRows={2}
        autosize
        {...getInputProps("bankAddress")}
        {...bindSanitizedInput(
          sanitizeDomiciliaryBankAddress,
          (value) => setFieldValue("bankAddress", value),
          DOMICILIARY_INPUT_LIMITS.postalAddress,
          undefined,
          afterSanitize("bankAddress")
        )}
        error={errors.bankAddress}
      />
    </div>
  );
}
