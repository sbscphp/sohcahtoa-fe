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
import BankDetailsFormSection from "./BankDetailsFormSection";

interface InternationalBankDetailsFieldsProps {
  form: UseFormReturnType<InternationalBankDetailsFormValues>;
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
  form.setFieldValue("paymentReference", "");
  form.clearFieldError("iban");
  form.clearFieldError("routingNumber");
  form.clearFieldError("ifscNumber");
  form.clearFieldError("purposeCode");
  form.clearFieldError("bsbCode");
  form.clearFieldError("paymentReference");

  if (nextRegion !== "OTHER") {
    form.setFieldValue("otherInformation", "");
    form.clearFieldError("otherInformation");
  }
}

function setSwiftFromInput(
  form: UseFormReturnType<InternationalBankDetailsFormValues>,
  field: "swiftCode" | "correspondenceBankSwiftCode",
  raw: string
) {
  const cleaned = raw.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);
  form.setFieldValue(field, cleaned);
}

export default function InternationalBankDetailsFields({
  form,
  trailingFields,
}: Readonly<InternationalBankDetailsFieldsProps>) {
  const v = form.values;
  const region = v.beneficiaryCountryRegion as BeneficiaryBankRegion;

  return (
    <div className="space-y-4">
      <Select
        label="Bank account country / region"
        description="Used to show the correct routing fields (IBAN, BSB, routing number, etc.)"
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

      <BankDetailsFormSection title="Beneficiary details">
        <TextInput
          label="Name of organization"
          required
          size="md"
          placeholder="As on invoice or registration"
          {...form.getInputProps("organizationName")}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Phone number"
            required
            size="md"
            placeholder="Enter"
            inputMode="tel"
            {...form.getInputProps("beneficiaryPhone")}
          />
          <TextInput
            label="Email"
            required
            size="md"
            placeholder="Enter"
            type="email"
            {...form.getInputProps("beneficiaryEmail")}
          />
        </div>
        <TextInput
          label="Address"
          required
          size="md"
          placeholder="Street address"
          {...form.getInputProps("beneficiaryAddress")}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput
            label="City"
            required
            size="md"
            placeholder="Enter"
            {...form.getInputProps("beneficiaryCity")}
          />
          <TextInput
            label="State"
            required
            size="md"
            placeholder="Enter"
            {...form.getInputProps("beneficiaryState")}
          />
          <TextInput
            label="Country"
            required
            size="md"
            placeholder="Enter"
            {...form.getInputProps("beneficiaryCountry")}
          />
        </div>
      </BankDetailsFormSection>

      <BankDetailsFormSection title="Beneficiary bank details">
        <TextInput
          label="Bank account name"
          required
          size="md"
          placeholder="Name on the account"
          {...form.getInputProps("bankAccountName")}
        />
        <Textarea
          label="Bank account address"
          required
          minRows={2}
          size="md"
          placeholder="Branch or head office address"
          {...form.getInputProps("bankAddress")}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Bank account IBAN"
            size="md"
            placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
            {...form.getInputProps("iban")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/\s/g, "").toUpperCase();
              form.setFieldValue("iban", raw);
            }}
            error={form.errors.iban as string | undefined}
          />
          <TextInput
            label="Bank account SWIFT / BIC"
            size="md"
            placeholder="e.g. ABCDUS33XXX"
            maxLength={11}
            {...form.getInputProps("swiftCode")}
            onChange={(e) => setSwiftFromInput(form, "swiftCode", e.currentTarget.value)}
            error={form.errors.swiftCode as string | undefined}
          />
        </div>
        <TextInput
          label="Bank account number"
          required
          size="md"
          placeholder="Enter"
          maxLength={34}
          {...form.getInputProps("accountNumber")}
        />
        <TextInput
          label="Correspondence bank name"
          size="md"
          placeholder="Optional"
          {...form.getInputProps("correspondenceBankName")}
        />
        <Textarea
          label="Correspondence bank address"
          minRows={2}
          size="md"
          placeholder="Optional"
          {...form.getInputProps("correspondenceBankAddress")}
        />
        <TextInput
          label="Correspondence bank SWIFT / BIC"
          size="md"
          placeholder="Optional"
          maxLength={11}
          {...form.getInputProps("correspondenceBankSwiftCode")}
          onChange={(e) =>
            setSwiftFromInput(form, "correspondenceBankSwiftCode", e.currentTarget.value)
          }
          error={form.errors.correspondenceBankSwiftCode as string | undefined}
        />
      </BankDetailsFormSection>

      <BankDetailsFormSection title="Payment identifiers (by bank country / region)">
        {region === "UK" ? null : (
          <p className="text-sm text-body-text-200 -mt-1">
            Fields below depend on the bank account country / region selected above.
          </p>
        )}

        {region !== "NG" ? (
          <TextInput
            label="Payment reference / ID"
            required
            size="md"
            placeholder="Enter"
            {...form.getInputProps("paymentReference")}
          />
        ) : null}

        {region === "US_CA" ? (
          <TextInput
            label="Routing number"
            required
            size="md"
            placeholder="e.g. 026009593"
            maxLength={9}
            inputMode="numeric"
            {...form.getInputProps("routingNumber")}
            onChange={(e) => {
              const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 9);
              form.setFieldValue("routingNumber", raw);
            }}
            error={form.errors.routingNumber as string | undefined}
          />
        ) : null}

        {region === "IN" ? (
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
              error={form.errors.ifscNumber as string | undefined}
            />
            <TextInput
              label="Purpose code"
              required
              size="md"
              placeholder="e.g. GIFT / P1301"
              {...form.getInputProps("purposeCode")}
            />
          </div>
        ) : null}

        {region === "AU" ? (
          <TextInput
            label="BSB code"
            required
            size="md"
            placeholder="e.g. 123-456"
            {...form.getInputProps("bsbCode")}
          />
        ) : null}

        {region === "OTHER" ? (
          <Textarea
            label="Other bank details"
            description="Any extra identifiers or instructions for this country (clearing codes, intermediary bank, etc.)."
            minRows={3}
            maxLength={2000}
            size="md"
            placeholder="Enter any additional information we should know for this transfer"
            {...form.getInputProps("otherInformation")}
          />
        ) : null}
      </BankDetailsFormSection>

      {trailingFields}
    </div>
  );
}
