"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";
import type { TransactionDetailCashPickup } from "@/app/_lib/api/types";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";

function formatStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatOptional(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return iso;
  return formatShortDate(iso);
}

interface CashPickupDetailsSectionProps {
  data: TransactionDetailCashPickup;
}

export default function CashPickupDetailsSection({ data }: CashPickupDetailsSectionProps) {
  const locationLine = [data.pickupLocation?.trim(), data.pickupCity, data.pickupState]
    .filter(Boolean)
    .join(", ");

  return (
    <SectionBlock title="Cash Pickup">
      <LabelText label="Pickup code" text={formatOptional(data.pickupCode)} />
      <LabelText label="Location" text={locationLine || "—"} />
      <LabelText
        label="Amount"
        amount={{
          code: data.currency,
          formatted: Number(data.amount).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        }}
      />
      <LabelText label="Status" text={formatStatus(data.status)} />
      <LabelText
        label="Scheduled date"
        text={
          data.scheduledPickupDate
            ? formatShortDate(data.scheduledPickupDate)
            : "—"
        }
      />
      <LabelText
        label="Scheduled time"
        text={
          data.scheduledPickupTime
            ? formatShortTime(data.scheduledPickupTime)
            : "—"
        }
      />
      <LabelText label="Expires" text={formatIsoDate(data.expiryDate)} />
      {/* <LabelText label="Recipient name" text={formatOptional(data.recipientName)} />
      <LabelText label="Recipient phone" text={formatOptional(data.recipientPhone)} /> */}
      {data.pickedUpAt ? (
        <LabelText
          label="Picked up"
          text={`${formatShortDate(data.pickedUpAt)} · ${formatShortTime(data.pickedUpAt)}`}
        />
      ) : null}
    </SectionBlock>
  );
}
