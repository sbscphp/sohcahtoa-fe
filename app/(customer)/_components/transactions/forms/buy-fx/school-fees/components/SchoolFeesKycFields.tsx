"use client";

import { TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { formatDateToIso } from "@/app/(customer)/_utils/input-validation";

interface SchoolFeesKycFieldsProps {
  ninNumber: string;
  passportDocumentNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  onNinChange: (value: string) => void;
  onPassportNumberChange: (value: string) => void;
  onPassportIssueDateChange: (isoDate: string) => void;
  onPassportExpiryDateChange: (isoDate: string) => void;
  ninDisabled?: boolean;
  ninError?: string;
  passportNumberError?: string;
  passportIssueDateError?: string;
  passportExpiryDateError?: string;
}

export default function SchoolFeesKycFields({
  ninNumber,
  passportDocumentNumber,
  passportIssueDate,
  passportExpiryDate,
  onNinChange,
  onPassportNumberChange,
  onPassportIssueDateChange,
  onPassportExpiryDateChange,
  ninDisabled = false,
  ninError,
  passportNumberError,
  passportIssueDateError,
  passportExpiryDateError,
}: Readonly<SchoolFeesKycFieldsProps>) {
  return (
    <div className="space-y-4 rounded-xl border border-[#E1E0E0] bg-white p-4">
      <p className="text-sm font-medium text-[#4D4B4B]">Applicant details (parent/guardian)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="NIN"
          required
          size="md"
          placeholder="NIN"
          maxLength={11}
          inputMode="numeric"
          autoComplete="off"
          value={ninNumber}
          onChange={(e) => {
            const raw = e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 11);
            onNinChange(raw);
          }}
          disabled={ninDisabled}
          error={ninError}
        />
        <TextInput
          label="Applicant International Passport Number"
          required
          size="md"
          placeholder="Up to 9 letters and numbers (e.g. A12345678)"
          maxLength={9}
          autoComplete="off"
          value={passportDocumentNumber}
          onChange={(e) => {
            const normalized = e.target.value
              .replaceAll(/[^A-Za-z0-9]/g, "")
              .toUpperCase()
              .slice(0, 9);
            onPassportNumberChange(normalized);
          }}
          error={passportNumberError}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          placeholder="Select"
          label="Applicant Passport Issued Date"
          required
          size="md"
          rightSectionPointerEvents="all"
          value={passportIssueDate?.trim() ? new Date(passportIssueDate) : null}
          onChange={(value) => onPassportIssueDateChange(formatDateToIso(value))}
          error={passportIssueDateError}
          rightSection={
            <HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />
          }
        />
        <DateInput
          placeholder="Select"
          label="Applicant Passport Expiry Date"
          required
          size="md"
          minDate={new Date()}
          rightSectionPointerEvents="all"
          value={passportExpiryDate?.trim() ? new Date(passportExpiryDate) : null}
          onChange={(value) => onPassportExpiryDateChange(formatDateToIso(value))}
          error={passportExpiryDateError}
          rightSection={
            <HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />
          }
        />
      </div>
    </div>
  );
}
