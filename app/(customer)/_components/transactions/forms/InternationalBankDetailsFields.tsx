"use client";

import type { ReactNode } from "react";
import { Select, TextInput, Textarea } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import {
  BENEFICIARY_REGION_OPTIONS,
  type BeneficiaryBankRegion,
  type InternationalBankDetailsFormValues,
} from "@/app/(customer)/_lib/international-bank-details-schema";

interface InternationalBankDetailsFieldsProps {
  form: UseFormReturnType<InternationalBankDetailsFormValues>;
  /** Optional fields rendered after bank rows (e.g. school fees invoice upload). */
  trailingFields?: ReactNode;
}

function clearFieldsForRegionChange(
  form: UseFormReturnType<InternationalBankDetailsFormValues>,
  nextRegion: BeneficiaryBankRegion
) {
  form.setFieldValue("iban", "");
  form.setFieldValue("routingNumber", "");
  form.setFieldValue("ifscNumber", "");
  form.setFieldValue("purposeCode", "");
  form.setFieldValue("bsbCode", "");
  form.clearFieldError("iban");
  form.clearFieldError("routingNumber");
  form.clearFieldError("ifscNumber");
  form.clearFieldError("purposeCode");
  form.clearFieldError("bsbCode");

  if (nextRegion !== "NG" && nextRegion !== "OTHER") {
    form.setFieldValue("swiftCode", "");
    form.clearFieldError("swiftCode");
  }
}

function accountPairLabel(region: BeneficiaryBankRegion): { rightLabel: string; rightRequired: boolean } {
  switch (region) {
    case "UK":
      return { rightLabel: "IBAN", rightRequired: true };
    case "US_CA":
      return { rightLabel: "Routing number (ABA)", rightRequired: true };
    case "IN":
      return { rightLabel: "IFSC code", rightRequired: true };
    case "AU":
      return { rightLabel: "BSB code", rightRequired: true };
    case "NG":
    case "OTHER":
      return { rightLabel: "SWIFT / BIC (if available)", rightRequired: false };
    default:
      return { rightLabel: "SWIFT / BIC (if available)", rightRequired: false };
  }
}

export default function InternationalBankDetailsFields({
  form,
  trailingFields,
}: Readonly<InternationalBankDetailsFieldsProps>) {
  const v = form.values;
  const region = v.beneficiaryCountryRegion as BeneficiaryBankRegion;
  const { rightLabel, rightRequired } = accountPairLabel(region);

  return (
    <div className="space-y-4">
      <Select
        label="Country / region"
        required
        placeholder="Select"
        size="md"
        data={BENEFICIARY_REGION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={v.beneficiaryCountryRegion}
        onChange={(next) => {
          const value = (next ?? "OTHER") as BeneficiaryBankRegion;
          clearFieldsForRegionChange(form, value);
          form.setFieldValue("beneficiaryCountryRegion", value);
        }}
        error={form.errors.beneficiaryCountryRegion as string | undefined}
        rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          className="md:col-span-2"
          label="Beneficiary name"
          required
          size="md"
          placeholder="As it appears on the account"
          {...form.getInputProps("beneficiaryName")}
        />
        <Textarea
          className="md:col-span-2"
          label="Beneficiary address"
          required
          minRows={2}
          placeholder="Street, city, postal code, country"
          {...form.getInputProps("beneficiaryAddress")}
        />
      </div>

      <TextInput
        label="Bank name"
        required
        size="md"
        placeholder="Enter bank name"
        {...form.getInputProps("bankName")}
      />

      <Textarea
        label="Bank address"
        required
        minRows={2}
        placeholder="Branch or head office address"
        {...form.getInputProps("bankAddress")}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          label="Account number"
          required
          size="md"
          placeholder="Account number"
          {...form.getInputProps("accountNumber")}
        />

        {region === "UK" ? (
          <TextInput
            label={rightLabel}
            required={rightRequired}
            size="md"
            placeholder="e.g. GB29NWBK60161331926819"
            {...form.getInputProps("iban")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/\s/g, "").toUpperCase();
              form.setFieldValue("iban", raw);
            }}
          />
        ) : null}

        {region === "US_CA" ? (
          <TextInput
            label={rightLabel}
            required={rightRequired}
            size="md"
            placeholder="9-digit routing number"
            maxLength={9}
            {...form.getInputProps("routingNumber")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 9);
              form.setFieldValue("routingNumber", raw);
            }}
          />
        ) : null}

        {region === "IN" ? (
          <TextInput
            label={rightLabel}
            required={rightRequired}
            size="md"
            placeholder="11 characters"
            maxLength={11}
            {...form.getInputProps("ifscNumber")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase();
              form.setFieldValue("ifscNumber", raw.slice(0, 11));
            }}
          />
        ) : null}

        {region === "AU" ? (
          <TextInput
            label={rightLabel}
            required={rightRequired}
            size="md"
            placeholder="e.g. 062-000"
            {...form.getInputProps("bsbCode")}
          />
        ) : null}

        {region === "NG" || region === "OTHER" ? (
          <TextInput
            label={rightLabel}
            required={rightRequired}
            size="md"
            placeholder="8–11 characters, e.g. ABCDGB2L"
            maxLength={11}
            {...form.getInputProps("swiftCode")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase();
              form.setFieldValue("swiftCode", raw.slice(0, 11));
            }}
          />
        ) : null}
      </div>

      {region === "IN" ? (
        <TextInput
          label="Purpose code"
          required
          size="md"
          placeholder="Purpose code for this remittance"
          {...form.getInputProps("purposeCode")}
        />
      ) : null}

      {trailingFields}
    </div>
  );
}
