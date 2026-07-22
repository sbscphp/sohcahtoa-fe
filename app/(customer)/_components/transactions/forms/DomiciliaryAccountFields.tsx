"use client";

import type { ReactNode } from "react";
import { Alert, TextInput, Textarea } from "@mantine/core";
import { Info } from "lucide-react";
import { DOMICILIARY_ACCOUNT_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import {
  DOMICILIARY_INPUT_LIMITS,
  sanitizeDomiciliaryAccountName,
  sanitizeDomiciliaryAccountNumber,
  sanitizeDomiciliaryBankAddress,
  sanitizeDomiciliaryBankName,
  sanitizeDomiciliaryIban,
  sanitizeDomiciliaryRoutingNumber,
  sanitizeDomiciliarySwiftCode,
} from "@/app/(customer)/_lib/domiciliary-account-schema";
import { bindSanitizedInput } from "@/app/_lib/input-field-rules";

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
};

export default function DomiciliaryAccountFields({
  getInputProps,
  setFieldValue,
  clearFieldError,
  errors = {},
  showInfoAlert = true,
}: Readonly<DomiciliaryAccountFieldsProps>) {
  const afterSanitize = (field: DomiciliaryFieldName) => () => clearFieldError?.(field);
  return (
    <div className="space-y-4">
      {showInfoAlert ? (
        <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
          <p className="text-body-text-200 text-sm">{DOMICILIARY_ACCOUNT_MESSAGE}</p>
        </Alert>
      ) : null}

      <TextInput
        label="Domiciliary Account Number"
        placeholder="Enter account number"
        required
        size="md"
        {...getInputProps("domiciliaryAccountNumber")}
        {...bindSanitizedInput(
          sanitizeDomiciliaryAccountNumber,
          (value) => setFieldValue("domiciliaryAccountNumber", value),
          DOMICILIARY_INPUT_LIMITS.bankAccountNumber,
          "numeric",
          afterSanitize("domiciliaryAccountNumber")
        )}
        error={errors.domiciliaryAccountNumber}
      />
      <TextInput
        label="Domiciliary Bank Name"
        placeholder="Enter bank name"
        required
        size="md"
        {...getInputProps("domiciliaryBankName")}
        {...bindSanitizedInput(
          sanitizeDomiciliaryBankName,
          (value) => setFieldValue("domiciliaryBankName", value),
          DOMICILIARY_INPUT_LIMITS.bankName,
          undefined,
          afterSanitize("domiciliaryBankName")
        )}
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
          description="Optional — include if your bank uses IBAN"
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
