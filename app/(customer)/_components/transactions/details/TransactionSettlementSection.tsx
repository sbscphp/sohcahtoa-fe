"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface TransactionSettlementData {
  settlementId: string;
  settlementDate: string;
  settlementTime: string;
  /** Final receipt when complete FX flow is settled; stamped and signed on date issued. */
  settlementReceipt?: { filename: string; url?: string };
  settlementStructureCash?: string; // e.g. "25% ~ $375"
  settlementStructurePrepaidCard?: string; // e.g. "75% ~ $1,125"
  paidInto?: string; // multi-line e.g. "GTB Bank Card\n11 ******** 6773"
  settlementStatus?: string; // e.g. "Completed"
}

interface TransactionSettlementSectionProps {
  data: TransactionSettlementData;
  onDownloadReceipt?: () => void;
}

const FINAL_RECEIPT_NOTE =
  "This is your final transaction receipt, issued when the complete FX flow is settled. Receipts are stamped and signed on the date issued.";

export default function TransactionSettlementSection({
  data,
  onDownloadReceipt,
}: TransactionSettlementSectionProps) {
  return (
    <SectionBlock title="Transaction Settlement">
      <p className="text-body-text-200 text-sm mb-3">{FINAL_RECEIPT_NOTE}</p>
      <LabelText label="Settlement ID" text={data.settlementId} />
      <LabelText label="Settlement Date" text={data.settlementDate} />
      <LabelText label="Settlement Time" text={data.settlementTime} />
      {data.settlementReceipt && (
        <LabelText
          label="Final settlement receipt (download)"
          document={{
            filename: data.settlementReceipt.filename,
            onDownload: onDownloadReceipt,
          }}
        />
      )}
      {data.settlementStructureCash != null && (
        <LabelText label="Settlement Structure (Cash)" text={data.settlementStructureCash} />
      )}
      {data.settlementStructurePrepaidCard != null && (
        <LabelText
          label="Settlement Structure (Prepaid Card)"
          text={data.settlementStructurePrepaidCard}
        />
      )}
      {data.paidInto != null && (
        <LabelText label="75% Paid Into" multiline={data.paidInto} className="w-full basis-full" />
      )}
      {data.settlementStatus != null && (
        <LabelText label="Settlement Status" statusBadge={data.settlementStatus} />
      )}
    </SectionBlock>
  );
}
