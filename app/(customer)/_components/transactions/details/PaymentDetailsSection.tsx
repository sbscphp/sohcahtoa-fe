"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface PaymentDetailsData {
  transactionId: string;
  transactionDate: string;
  transactionTime: string;
  /** Receipt shared on first transaction inflow success; stamped and signed on date issued. */
  transactionReceipt?: { filename: string; url?: string };
  paidTo: string; // multi-line: "Name\nBank\nAccount"
}

interface PaymentDetailsSectionProps {
  data: PaymentDetailsData;
  onDownloadReceipt?: () => void;
}

const RECEIPT_NOTE =
  "This receipt is issued on first transaction inflow success. You will receive a final transaction receipt when the complete FX flow is settled.";

export default function PaymentDetailsSection({
  data,
  onDownloadReceipt,
}: PaymentDetailsSectionProps) {
  return (
    <SectionBlock title="Payment Details">
      <p className="text-body-text-200 text-sm mb-3">{RECEIPT_NOTE}</p>
      <LabelText label="Transaction ID" text={data.transactionId} />
      <LabelText label="Transaction Date" text={data.transactionDate} />
      <LabelText label="Transaction Time" text={data.transactionTime} />
      {data.transactionReceipt && (
        <LabelText
          label="Transaction Receipt (download)"
          document={{
            filename: data.transactionReceipt.filename,
            onDownload: onDownloadReceipt,
          }}
        />
      )}
      <LabelText label="Paid to" multiline={data.paidTo} className="w-full basis-full" />
    </SectionBlock>
  );
}
