"use client";

import { Button } from "@mantine/core";
import { formatDateTime } from "../_lib/format-fx";
import type { CashDisbursementNotice } from "../_lib/types";

interface Props {
  notice: CashDisbursementNotice;
  onReject: () => void;
  onConfirm: () => void;
}

export function CashReceiptBanner({ notice, onReject, onConfirm }: Readonly<Props>) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary-25 bg-[#FFF6F1] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-base font-semibold text-body-text-400">
          {notice.currency} {notice.amount.toLocaleString("en-US")} from Admin
        </p>
        <p className="text-xs text-body-text-100">
          {notice.purpose} · Disbursed by {notice.disbursedBy} · {formatDateTime(notice.disbursedAt)} · Ref{" "}
          {notice.reference}
        </p>
      </div>
      <div className="flex shrink-0 gap-3">
        <Button variant="outline" radius="xl" onClick={onReject} className="border-primary-25! bg-white! text-primary-400!">
          Reject
        </Button>
        <Button radius="xl" onClick={onConfirm} className="bg-primary-400! hover:bg-primary-500!">
          Confirm Receipt
        </Button>
      </div>
    </div>
  );
}
