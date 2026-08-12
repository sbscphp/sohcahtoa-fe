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

/** API may send station contact on a few optional keys. */
type CashPickupWithStationContact = TransactionDetailCashPickup & {
  address?: string | null;
  pickupAddress?: string | null;
  phoneNumber?: string | null;
  pickupPhone?: string | null;
  pickupPhoneNumber?: string | null;
};

interface CashPickupDetailsSectionProps {
  data: TransactionDetailCashPickup;
}

export default function CashPickupDetailsSection({ data }: CashPickupDetailsSectionProps) {
  const pickup = data as CashPickupWithStationContact;
  const locationLine = [pickup.pickupLocation?.trim(), pickup.pickupCity, pickup.pickupState]
    .filter(Boolean)
    .join(", ");
  const address = formatOptional(
    pickup.address ?? pickup.pickupAddress
  );
  const phone = formatOptional(
    pickup.phoneNumber ?? pickup.pickupPhone ?? pickup.pickupPhoneNumber
  );

  return (
    <SectionBlock title="Cash Pickup">
      <LabelText label="Pickup code" text={formatOptional(pickup.pickupCode)} />
      <LabelText label="Location" text={locationLine || "—"} />
      <LabelText label="Address" text={address} />
      <LabelText label="Phone" text={phone} />
      <LabelText
        label="Amount"
        amount={{
          code: pickup.currency,
          formatted: Number(pickup.amount).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        }}
      />
      <LabelText label="Status" text={formatStatus(pickup.status)} />
      <LabelText
        label="Scheduled date"
        text={
          pickup.scheduledPickupDate
            ? formatShortDate(pickup.scheduledPickupDate)
            : "—"
        }
      />
      <LabelText
        label="Scheduled time"
        text={formatOptional(pickup.scheduledPickupTime)}
      />
      {pickup.pickedUpAt ? (
        <LabelText
          label="Picked up"
          text={`${formatShortDate(pickup.pickedUpAt)} · ${formatShortTime(pickup.pickedUpAt)}`}
        />
      ) : null}
    </SectionBlock>
  );
}
