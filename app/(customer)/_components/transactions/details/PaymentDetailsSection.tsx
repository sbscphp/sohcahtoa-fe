"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface PaymentDetailsData {
  transactionId: string;
  transactionDate: string;
  transactionTime: string;
  transactionReceipt?: { filename: string; url?: string };
  paidTo: string; // multi-line: "Name\nBank\nAccount"
}

interface PaymentDetailsSectionProps {
  data: PaymentDetailsData;
  onDownloadReceipt?: () => void;
}

export default function PaymentDetailsSection({
  data,
  onDownloadReceipt,
}: PaymentDetailsSectionProps) {
  return (
    <SectionBlock title="Payment Details">
      <LabelText label="Transaction ID" text={data.transactionId} />
      <LabelText label="Transaction Date" text={data.transactionDate} />
      <LabelText label="Transaction Time" text={data.transactionTime} />
      {data.transactionReceipt && (
        <LabelText
          label="Transaction Receipt"
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
