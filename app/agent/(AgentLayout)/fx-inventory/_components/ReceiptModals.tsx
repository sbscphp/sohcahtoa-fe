"use client";

import { useState, type ReactNode } from "react";
import { Button, Modal, Textarea } from "@mantine/core";
import { X } from "lucide-react";
import { formatMoney } from "../_lib/format-fx";
import type { CashDisbursement } from "../_lib/types";

interface BaseProps {
  opened: boolean;
  onClose: () => void;
  item: CashDisbursement;
  agentName: string;
  isPending: boolean;
}

function DetailRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 text-sm last:border-b-0">
      <span className="text-body-text-50">{label}</span>
      <span className="font-medium text-body-text-400">{value}</span>
    </div>
  );
}

function ReceiptDetails({ item, agentName }: Readonly<{ item: CashDisbursement; agentName: string }>) {
  return (
    <div className="rounded-xl bg-gray-50 px-4">
      <DetailRow label="Agent" value={agentName} />
      <DetailRow label="Currency" value={item.currency || "—"} />
      <DetailRow label="Disbursed Amount" value={item.amount == null ? "—" : formatMoney(item.amount, item.currency)} />
      <DetailRow label="Reference" value={item.reference} />
    </div>
  );
}

function ReceiptModal({
  opened,
  onClose,
  title,
  subtitle,
  children,
}: Readonly<{ opened: boolean; onClose: () => void; title: string; subtitle: string; children: ReactNode }>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      title={
        <div>
          <p className="text-lg font-semibold text-body-heading-300">{title}</p>
          <p className="text-sm text-body-text-50">{subtitle}</p>
        </div>
      }
      closeButtonProps={{ icon: <X size={16} /> }}
    >
      <div className="pt-2">{children}</div>
    </Modal>
  );
}

const cancelBtn = { variant: "outline", color: "gray", radius: "xl" } as const;

export function ConfirmCashReceiptModal({
  opened,
  onClose,
  item,
  agentName,
  isPending,
  onConfirm,
}: Readonly<BaseProps & { onConfirm: () => void }>) {
  return (
    <ReceiptModal
      opened={opened}
      onClose={onClose}
      title="Confirm Cash Receipt"
      subtitle="Review the details before confirming or rejecting"
    >
      <ReceiptDetails item={item} agentName={agentName} />
      <div className="mt-6 flex justify-end gap-3">
        <Button {...cancelBtn} onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button radius="xl" loading={isPending} onClick={onConfirm} className="bg-primary-400! hover:bg-primary-500!">
          Confirm Receipt
        </Button>
      </div>
    </ReceiptModal>
  );
}

/** Mounted only while the modal is open, so the step and reason reset on every open. */
function RejectBody({
  item,
  agentName,
  onClose,
  isPending,
  onSubmit,
}: Readonly<Omit<BaseProps, "opened"> & { onSubmit: (reason: string) => void }>) {
  const [step, setStep] = useState<"review" | "reason">("review");
  const [reason, setReason] = useState("");

  return (
    <>
      <p className="mb-3 text-sm text-body-text-50">
        {step === "review" ? "Review the details before rejecting" : "Enter reason(s) for rejecting"}
      </p>
      <ReceiptDetails item={item} agentName={agentName} />
      {step === "reason" && (
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
        <Button {...cancelBtn} onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        {step === "review" ? (
          <Button radius="xl" onClick={() => setStep("reason")} className="bg-primary-400! hover:bg-primary-500!">
            Yes, Reject
          </Button>
        ) : (
          <Button
            radius="xl"
            loading={isPending}
            disabled={!reason.trim()}
            onClick={() => onSubmit(reason.trim())}
            className="bg-[#E4513D]! hover:bg-[#cc4432]!"
          >
            Submit Rejection
          </Button>
        )}
      </div>
    </>
  );
}

export function RejectCashReceiptModal({
  opened,
  onClose,
  item,
  agentName,
  isPending,
  onSubmit,
}: Readonly<BaseProps & { onSubmit: (reason: string) => void }>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      title={<p className="text-lg font-semibold text-body-heading-300">Reject Cash Receipt</p>}
      closeButtonProps={{ icon: <X size={16} /> }}
    >
      <RejectBody item={item} agentName={agentName} onClose={onClose} isPending={isPending} onSubmit={onSubmit} />
    </Modal>
  );
}
