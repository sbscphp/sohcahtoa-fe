"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface TransactionSettlementData {
  settlementId: string;
  settlementDate: string;
  settlementTime: string;
  settlementAmount?: { code: string; formatted: string };
  paymentMethod?: string;
  paymentReference?: string;
  settlementReceipt?: { filename: string; url?: string };
  settlementStructureCash?: string;
  settlementStructurePrepaidCard?: string;
  paidInto?: string;
  settlementStatus?: string;
}

interface TransactionSettlementSectionProps {
  data: TransactionSettlementData;
  onDownloadReceipt?: () => void;
  onViewReceipt?: (url: string, filename: string) => void;
}

export default function TransactionSettlementSection({
  data,
  onDownloadReceipt,
  onViewReceipt,
}: TransactionSettlementSectionProps) {
  return (
    <SectionBlock title="Transaction Settlement">
      <LabelText hideWhenEmpty label="Settlement ID" text={data.settlementId} wrapText />
      <LabelText hideWhenEmpty label="Settlement Date" text={data.settlementDate} />
      <LabelText hideWhenEmpty label="Settlement Time" text={data.settlementTime} />
      {data.settlementAmount ? (
        <LabelText hideWhenEmpty label="Settlement Amount" amount={data.settlementAmount} />
      ) : null}
      <LabelText hideWhenEmpty label="Payment Method" text={data.paymentMethod} />
      <LabelText hideWhenEmpty label="Payment Reference" text={data.paymentReference} wrapText />
      {data.settlementReceipt ? (
        <LabelText
          label="Proof of payment"
          document={{
            filename: data.settlementReceipt.filename,
            url: data.settlementReceipt.url,
            onView:
              data.settlementReceipt.url && onViewReceipt
                ? () =>
                    onViewReceipt(
                      data.settlementReceipt!.url as string,
                      data.settlementReceipt!.filename
                    )
                : undefined,
            onDownload: onDownloadReceipt,
          }}
        />
      ) : null}
      <LabelText
        hideWhenEmpty
        label="Settlement Structure (Cash)"
        text={data.settlementStructureCash}
      />
      <LabelText
        hideWhenEmpty
        label="Settlement Structure (Prepaid Card)"
        text={data.settlementStructurePrepaidCard}
      />
      <LabelText hideWhenEmpty label="Paid Into" multiline={data.paidInto} className="w-full basis-full" />
      <LabelText hideWhenEmpty label="Settlement Status" statusBadge={data.settlementStatus} />
    </SectionBlock>
  );
}
