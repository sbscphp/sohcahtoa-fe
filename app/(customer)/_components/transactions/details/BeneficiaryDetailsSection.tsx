"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

interface BeneficiaryDetailsSectionProps {
  data: Record<string, unknown>;
}

export default function BeneficiaryDetailsSection({ data }: BeneficiaryDetailsSectionProps) {
  const entries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <SectionBlock title="Beneficiary Details">
      {entries.map(([key, value]) => (
        <LabelText key={key} label={formatFieldLabel(key)} text={formatValue(value)} />
      ))}
    </SectionBlock>
  );
}
