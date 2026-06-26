"use client";

import { Alert, TextInput, Textarea } from "@mantine/core";
import { Info } from "lucide-react";
import { DOMICILIARY_ACCOUNT_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";

type DomiciliaryFieldName =
  | "domiciliaryAccountNumber"
  | "domiciliaryBankName"
  | "accountName"
  | "swiftCode"
  | "routingNumber"
  | "bankAddress";

type DomiciliaryAccountFieldsProps = {
  getInputProps: (field: DomiciliaryFieldName) => object;
  setFieldValue: (field: DomiciliaryFieldName, value: string) => void;
};

export default function DomiciliaryAccountFields({
  getInputProps,
  setFieldValue,
}: Readonly<DomiciliaryAccountFieldsProps>) {
  return (
    <div className="space-y-4">
      <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
        <p className="text-body-text-200 text-sm">{DOMICILIARY_ACCOUNT_MESSAGE}</p>
      </Alert>

      <TextInput
        label="Domiciliary Account Number"
        placeholder="Enter account number"
        required
        size="md"
        {...getInputProps("domiciliaryAccountNumber")}
      />
      <TextInput
        label="Domiciliary Bank Name"
        placeholder="Enter bank name"
        required
        size="md"
        {...getInputProps("domiciliaryBankName")}
      />
      <TextInput
        label="Account Name"
        placeholder="Enter account name"
        required
        size="md"
        {...getInputProps("accountName")}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="SWIFT Code"
          placeholder="Enter SWIFT / BIC"
          required
          size="md"
          {...getInputProps("swiftCode")}
          onChange={(event) => {
            setFieldValue("swiftCode", event.currentTarget.value.toUpperCase());
          }}
        />
        <TextInput
          label="Routing Number"
          placeholder="Enter routing number"
          required
          size="md"
          {...getInputProps("routingNumber")}
        />
      </div>
      <Textarea
        label="Bank Address"
        placeholder="Enter bank address"
        required
        size="md"
        minRows={2}
        autosize
        {...getInputProps("bankAddress")}
      />
    </div>
  );
}
