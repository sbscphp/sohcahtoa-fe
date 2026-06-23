"use client";

import { TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { formatDateToIso } from "@/app/(customer)/_utils/input-validation";

interface SchoolFeesStudentPassportFieldsProps {
  studentPassportDocumentNumber: string;
  studentPassportIssueDate: string;
  studentPassportExpiryDate: string;
  onPassportNumberChange: (value: string) => void;
  onPassportIssueDateChange: (isoDate: string) => void;
  onPassportExpiryDateChange: (isoDate: string) => void;
  passportNumberError?: string;
  passportIssueDateError?: string;
  passportExpiryDateError?: string;
}

export default function SchoolFeesStudentPassportFields({
  studentPassportDocumentNumber,
  studentPassportIssueDate,
  studentPassportExpiryDate,
  onPassportNumberChange,
  onPassportIssueDateChange,
  onPassportExpiryDateChange,
  passportNumberError,
  passportIssueDateError,
  passportExpiryDateError,
}: Readonly<SchoolFeesStudentPassportFieldsProps>) {
  return (
    <div className="space-y-4 rounded-xl border border-[#E1E0E0] bg-[#FAFAFA] p-4">
      <p className="text-sm font-medium text-[#4D4B4B]">Student passport details</p>
      <TextInput
        label="Student International Passport Number"
        required
        size="md"
        placeholder="Up to 9 letters and numbers (e.g. A12345678)"
        maxLength={9}
        autoComplete="off"
        value={studentPassportDocumentNumber}
        onChange={(e) => {
          const normalized = e.target.value
            .replaceAll(/[^A-Za-z0-9]/g, "")
            .toUpperCase()
            .slice(0, 9);
          onPassportNumberChange(normalized);
        }}
        error={passportNumberError}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          placeholder="Select"
          label="Student Passport Issued Date"
          required
          size="md"
          rightSectionPointerEvents="all"
          value={studentPassportIssueDate?.trim() ? new Date(studentPassportIssueDate) : null}
          onChange={(value) => onPassportIssueDateChange(formatDateToIso(value))}
          error={passportIssueDateError}
          rightSection={
            <HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />
          }
        />
        <DateInput
          placeholder="Select"
          label="Student Passport Expiry Date"
          required
          size="md"
          minDate={new Date()}
          rightSectionPointerEvents="all"
          value={studentPassportExpiryDate?.trim() ? new Date(studentPassportExpiryDate) : null}
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
