"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Collapse } from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import LabelText from "./LabelText";

const PAYMENT_SECTION_TITLE_CLASS =
  "font-medium text-lg leading-[26px] text-[#DD4F05]";

const PAYMENT_BODY_GRID =
  "grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 px-8 *:min-w-0";

const PAYMENT_BODY_GRID_NESTED =
  "grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 *:min-w-0";

export interface PaymentInflowLine {
  id: string;
  amount: string;
  currency: string;
  settledAmount?: string | null;
  feeAmount?: string | null;
  sourceAccountNumber?: string | null;
  sourceAccountName?: string | null;
  sourceBankName?: string | null;
  tranRemarks?: string | null;
  tranDateTime: string;
  status: string;
  verifiedAt?: string | null;
}

/** Shaped from API `paymentDetails[]` only. */
export interface PaymentDetailsData {
  inflows: PaymentInflowLine[];
}

interface PaymentDetailsSectionProps {
  data: PaymentDetailsData;
}

function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (Number.isFinite(n)) {
    return `${currency} ${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${currency} ${amount}`;
}

function formatPaymentStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function paymentLineFields(line: PaymentInflowLine): ReactNode[] {
  const k = line.id;
  const nodes: ReactNode[] = [];

  nodes.push(
    <LabelText key={`${k}-amount`} label="Amount" text={formatMoney(line.amount, line.currency)} />
  );

  if (line.settledAmount != null && String(line.settledAmount).trim() !== "") {
    nodes.push(
      <LabelText
        key={`${k}-settled`}
        label="Settled amount"
        text={formatMoney(String(line.settledAmount), line.currency)}
      />
    );
  }

  if (line.feeAmount != null && String(line.feeAmount).trim() !== "") {
    nodes.push(
      <LabelText key={`${k}-fee`} label="Fee" text={formatMoney(String(line.feeAmount), line.currency)} />
    );
  }

  nodes.push(
    <LabelText key={`${k}-status`} label="Status" statusBadge={formatPaymentStatusLabel(line.status)} />
  );

  if (line.sourceBankName) {
    nodes.push(
      <LabelText key={`${k}-bank`} label="Source bank" text={line.sourceBankName} />
    );
  }

  if (line.sourceAccountName) {
    nodes.push(
      <LabelText
        key={`${k}-acct-name`}
        label="Source account name"
        text={line.sourceAccountName}
        className="md:col-span-2 xl:col-span-3"
      />
    );
  }

  if (line.sourceAccountNumber) {
    nodes.push(
      <LabelText
        key={`${k}-acct-no`}
        label="Source account number"
        text={line.sourceAccountNumber}
        className={
          line.sourceAccountName ? "md:col-span-1 xl:col-span-2" : "md:col-span-3 xl:col-span-5"
        }
      />
    );
  }

  if (line.tranRemarks) {
    nodes.push(
      <LabelText
        key={`${k}-remarks`}
        label="Remarks"
        text={line.tranRemarks}
        className="md:col-span-3 xl:col-span-5"
      />
    );
  }

  if (line.verifiedAt) {
    nodes.push(
      <LabelText
        key={`${k}-verified`}
        label="Verified at"
        text={`${formatShortDate(line.verifiedAt)} · ${formatShortTime(line.verifiedAt)}`}
        className="md:col-span-3 xl:col-span-5"
      />
    );
  }

  return nodes;
}

export default function PaymentDetailsSection({ data }: PaymentDetailsSectionProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const inflows = data.inflows ?? [];
  const extraCount = Math.max(0, inflows.length - 1);

  if (inflows.length === 0) {
    return null;
  }

  const extraFieldNodes = inflows.slice(1).flatMap((line) => paymentLineFields(line));

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center px-8">
        <h3 className={PAYMENT_SECTION_TITLE_CLASS}>Payment Details</h3>
      </div>
      <div className={PAYMENT_BODY_GRID}>
        {paymentLineFields(inflows[0])}
        {extraCount > 0 ? (
          <>
            <div className="col-span-full min-w-0">
              <Collapse in={moreOpen} transitionDuration={220}>
                <div className={PAYMENT_BODY_GRID_NESTED}>{extraFieldNodes}</div>
              </Collapse>
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="col-span-full flex items-center justify-center gap-2 text-sm font-medium text-[#DD4F05] hover:text-[#B84204] transition-colors py-1"
              aria-expanded={moreOpen}
            >
              {moreOpen ? "View less" : `View more (${extraCount} more)`}
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ease-out ${moreOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
