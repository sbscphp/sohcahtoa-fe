"use client";

import {
  beneficiaryDetailSectionTitle,
  hasDetailRecordEntries,
} from "@/app/(customer)/_lib/resolve-transaction-payout-display";
import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

const HIDDEN_DETAIL_KEYS = new Set(["isDomiciliaryAccount"]);

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
  title?: string;
}

export default function BeneficiaryDetailsSection({
  data,
  title,
}: Readonly<BeneficiaryDetailsSectionProps>) {
  if (!hasDetailRecordEntries(data)) {
    return null;
  }

  const entries = Object.entries(data).filter(
    ([key, value]) =>
      !HIDDEN_DETAIL_KEYS.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );

  if (entries.length === 0) {
    return null;
  }

  const sectionTitle = title ?? beneficiaryDetailSectionTitle(data);

  return (
    <SectionBlock title={sectionTitle}>
      {entries.map(([key, value]) => (
        <LabelText key={key} label={formatFieldLabel(key)} text={formatValue(value)} />
      ))}
    </SectionBlock>
  );
}
