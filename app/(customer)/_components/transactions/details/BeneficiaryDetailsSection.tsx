"use client";

import {
  beneficiaryDetailSectionTitle,
  getBeneficiaryDetailRows,
  hasDetailRecordEntries,
} from "@/app/(customer)/_lib/resolve-transaction-payout-display";
import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

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

  const rows = getBeneficiaryDetailRows(data);
  if (rows.length === 0) {
    return null;
  }

  const sectionTitle = title ?? beneficiaryDetailSectionTitle(data);

  return (
    <SectionBlock title={sectionTitle}>
      {rows.map((row) => (
        <LabelText key={row.key} label={row.label} text={row.value} wrapText />
      ))}
    </SectionBlock>
  );
}
