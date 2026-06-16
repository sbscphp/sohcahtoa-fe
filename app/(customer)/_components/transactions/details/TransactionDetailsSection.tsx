"use client";

import LabelText, { isBlankDetailText } from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface TransactionDetailsData {
  transactionId: string;
  amount: { code: string; formatted: string };
  equivalentAmount: { code: string; formatted: string };
  dateInitiated: string;
  pickupAddress: string;
}

interface TransactionDetailsSectionProps {
  data: TransactionDetailsData;
}

export default function TransactionDetailsSection({ data }: TransactionDetailsSectionProps) {
  const hasAny =
    !isBlankDetailText(data.transactionId) ||
    !isBlankDetailText(data.amount.formatted) ||
    !isBlankDetailText(data.equivalentAmount.formatted) ||
    !isBlankDetailText(data.dateInitiated);

  if (!hasAny) {
    return null;
  }

  return (
    <SectionBlock title="Transaction Details">
      <LabelText
        hideWhenEmpty
        label="Transaction ID"
        text={data.transactionId}
        wrapText
        className="col-span-full"
      />
      <LabelText hideWhenEmpty label="Amount" amount={data.amount} />
      <LabelText hideWhenEmpty label="Equivalent Amount" amount={data.equivalentAmount} />
      <LabelText hideWhenEmpty label="Date initiated" text={data.dateInitiated} />
      {/* <LabelText label="Pickup Address" text={data.pickupAddress} className="w-full basis-full" /> */}
    </SectionBlock>
  );
}
