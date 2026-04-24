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

  if (nextRegion !== "OTHER") {
    form.setFieldValue("otherInformation", "");
    form.clearFieldError("otherInformation");
  }
}

function setSwiftFromInput(
  form: UseFormReturnType<InternationalBankDetailsFormValues>,
  raw: string
) {
  const cleaned = raw.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);
  form.setFieldValue("swiftCode", cleaned);
}

export default function InternationalBankDetailsFields({
  form,
  trailingFields,
}: Readonly<InternationalBankDetailsFieldsProps>) {
  const v = form.values;
  const region = v.beneficiaryCountryRegion as BeneficiaryBankRegion;

  const swiftProps = {
    label: "SWIFT / BIC",
    size: "md" as const,
    placeholder: "e.g. ABCDUS33XXX",
    maxLength: 11,
    ...form.getInputProps("swiftCode"),
    onChange: (e: { currentTarget: { value: string } }) => setSwiftFromInput(form, e.currentTarget.value),
  };

  const swiftPaymentRow = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TextInput {...swiftProps} description="Optional" />
      <TextInput
        label="Payment reference / ID"
        required
        size="md"
        placeholder="Enter"
        {...form.getInputProps("paymentReference")}
      />
    </div>
  );

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

      <TextInput
        label="Beneficiary name"
        required
        size="md"
        placeholder="As it appears on the account"
        {...form.getInputProps("beneficiaryName")}
      />

      <Textarea
        label="Beneficiary address"
        required
        minRows={2}
        placeholder="Street, state, city, postal code, country"
        {...form.getInputProps("beneficiaryAddress")}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          label="Bank name"
          required
          size="md"
          placeholder="Enter"
          {...form.getInputProps("bankName")}
        />
        <TextInput
          label="Account number"
          required
          size="md"
          placeholder="Enter"
          {...form.getInputProps("accountNumber")}
        />
      </div>

      <Textarea
        label="Bank address"
        required
        minRows={2}
        placeholder="Branch or head office address"
        {...form.getInputProps("bankAddress")}
      />

      {region === "UK" ? (
        <>
          {swiftPaymentRow}
          <TextInput
            label="IBAN"
            required
            size="md"
            placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
            {...form.getInputProps("iban")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/\s/g, "").toUpperCase();
              form.setFieldValue("iban", raw);
            }}
          />
        </>
      ) : null}

      {region === "US_CA" ? (
        <>
          {swiftPaymentRow}
          <TextInput
            label="Routing number (ABA)"
            required
            size="md"
            placeholder="e.g. 026009593"
            maxLength={9}
            {...form.getInputProps("routingNumber")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 9);
              form.setFieldValue("routingNumber", raw);
            }}
          />
        </>
      ) : null}

      {region === "IN" ? (
        <>
          {swiftPaymentRow}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="IFSC number"
              required
              size="md"
              placeholder="e.g. SBIN0000001"
              maxLength={11}
              {...form.getInputProps("ifscNumber")}
              onChange={(e) => {
                const raw = e.currentTarget.value.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase();
                form.setFieldValue("ifscNumber", raw.slice(0, 11));
              }}
            />
            <TextInput
              label="Purpose code"
              required
              size="md"
              placeholder="e.g. GIFT / P1301"
              {...form.getInputProps("purposeCode")}
            />
          </div>
        </>
      ) : null}

      {region === "AU" ? (
        <>
          {swiftPaymentRow}
          <TextInput
            label="BSB code"
            required
            size="md"
            placeholder="e.g. 123-456"
            {...form.getInputProps("bsbCode")}
          />
        </>
      ) : null}

      {region === "NG" ? swiftPaymentRow : null}

      {region === "OTHER" ? (
        <>
          {swiftPaymentRow}
          <Textarea
            label="Other bank details"
            description="Any extra identifiers or instructions for this country (clearing codes, intermediary bank, etc.)."
            minRows={3}
            maxLength={2000}
            size="md"
            placeholder="Enter any additional information we should know for this transfer"
            {...form.getInputProps("otherInformation")}
          />
        </>
      ) : null}

      {trailingFields}
    </div>
  );
}
