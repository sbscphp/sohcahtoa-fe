"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface RequiredDocumentsData {
  bvn: string;
  nin?: string;
  tin?: string;
  formAId: string;
  formA?: { filename: string; url?: string };
  utilityBill?: { filename: string; url?: string };
  visa?: { filename: string; url?: string };
  returnTicket?: { filename: string; url?: string };
}

interface RequiredDocumentsSectionProps {
  data: RequiredDocumentsData;
  onDownload?: (doc: string, filename: string) => void;
}

export default function RequiredDocumentsSection({
  data,
  onDownload,
}: RequiredDocumentsSectionProps) {
  const makeDoc = (d: { filename: string; url?: string } | undefined, key: string) =>
    d
      ? {
          filename: d.filename,
          onDownload: onDownload ? () => onDownload(key, d.filename) : undefined,
        }
      : undefined;

  return (
    <SectionBlock title="Required Documents">
      <LabelText label="BVN" text={data.bvn} />
      {data.nin != null && <LabelText label="NIN" text={data.nin} />}
      {data.tin != null && <LabelText label="TIN" text={data.tin} />}
      <LabelText label="Form A ID" text={data.formAId} />
      {data.formA && (
        <LabelText label="Form A" document={makeDoc(data.formA, "formA")} />
      )}
      {data.utilityBill && (
        <LabelText label="Utility Bill" document={makeDoc(data.utilityBill, "utilityBill")} />
      )}
      {data.visa && (
        <LabelText label="Visa" document={makeDoc(data.visa, "visa")} />
      )}
      {data.returnTicket && (
        <LabelText label="Return Ticket" document={makeDoc(data.returnTicket, "returnTicket")} />
      )}
    </SectionBlock>
  );
}
