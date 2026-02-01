"use client";

import LabelText from "./LabelText";
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
  return (
    <SectionBlock title="Transaction Details">
      <LabelText label="Transaction ID" text={data.transactionId} />
      <LabelText label="Amount" amount={data.amount} />
      <LabelText label="Equivalent Amount" amount={data.equivalentAmount} />
      <LabelText label="Date initiated" text={data.dateInitiated} />
      <LabelText label="Pickup Address" text={data.pickupAddress} className="w-full basis-full" />
    </SectionBlock>
  );
}
