"use client";

import { useState } from "react";
import { Button, Modal, Textarea } from "@mantine/core";
import { X } from "lucide-react";
import { formatMoney } from "../_lib/format-fx";
import type { CashDisbursementNotice } from "../_lib/types";

export type ReceiptModalMode = "review" | "reject";

interface Props {
  opened: boolean;
  mode: ReceiptModalMode;
  onModeChange: (mode: ReceiptModalMode) => void;
  onClose: () => void;
  notice: CashDisbursementNotice;
  onConfirm: () => void;
  onReject: (reason: string) => void;
}

function DetailRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 text-sm last:border-b-0">
      <span className="text-body-text-50">{label}</span>
      <span className="font-medium text-body-text-400">{value}</span>
    </div>
  );
}

export function ConfirmCashReceiptModal({
  opened,
  onClose,
  ...rest
}: Readonly<Props>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      title={
        <div>
          <p className="text-lg font-semibold text-body-heading-300">
            Confirm Cash Receipt
          </p>
          <p className="text-sm text-body-text-50">
            Review the details before confirming or rejecting
          </p>
        </div>
      }
      closeButtonProps={{ icon: <X size={16} /> }}
    >
      <ReceiptBody onClose={onClose} {...rest} />
    </Modal>
  );
}

/** Mounted only while the modal is open, so the reason resets on every open. */
function ReceiptBody({
  mode,
  onModeChange,
  onClose,
  notice,
  onConfirm,
  onReject,
}: Readonly<Omit<Props, "opened">>) {
  const [reason, setReason] = useState("");

  return (
    <div className="pt-2">
      <div className="rounded-xl bg-gray-50 px-4">
        <DetailRow label="Agent" value={notice.agentName} />
        <DetailRow label="Currency" value={notice.currency} />
        <DetailRow
          label="Disbursed Amount"
          value={formatMoney(notice.amount, notice.currency)}
        />
        <DetailRow label="Reference" value={notice.reference} />
      </div>

      {mode === "reject" && (
        <Textarea
          mt="md"
          label="Reason(s) for rejection"
          placeholder="enter reason here, e.g. cash was not received..."
          minRows={3}
          autosize
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
      )}

      <div className="mt-6 flex justify-end gap-3">
        {mode === "review" ? (
          <>
            <Button
              variant="outline"
              color="gray"
              radius="xl"
              onClick={() => onModeChange("reject")}
            >
              Reject
            </Button>
            <Button
              radius="xl"
              onClick={onConfirm}
              className="bg-primary-400! hover:bg-primary-500!"
            >
              Confirm Receipt
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              color="gray"
              radius="xl"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              disabled={!reason.trim()}
              onClick={() => onReject(reason.trim())}
              className="bg-[#E4513D]! hover:bg-[#cc4432]!"
            >
              Submit Rejection
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
