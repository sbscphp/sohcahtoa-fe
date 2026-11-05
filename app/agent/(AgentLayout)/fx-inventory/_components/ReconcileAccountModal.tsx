"use client";

import { useState } from "react";
import { Button, Modal, NumberInput, Select, Textarea, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { getCurrencySymbol } from "@/app/(customer)/_lib/currency";
import { formatMoney } from "../_lib/format-fx";
import type { ReconciliationRow } from "../_lib/types";

interface Props {
  opened: boolean;
  onClose: () => void;
  rows: ReconciliationRow[];
  onSubmit: (currency: string, physicalCount: number, notes: string) => void;
}

/** Mounted only while the modal is open, so its state resets on every open. */
function ReconcileForm({ onClose, rows, onSubmit }: Readonly<Omit<Props, "opened">>) {
  const [currency, setCurrency] = useState<string | null>(rows[0]?.currency ?? null);
  const [physicalCount, setPhysicalCount] = useState<number | string>("");
  const [notes, setNotes] = useState("");

  const selected = rows.find((r) => r.currency === currency);
  const canSubmit = selected != null && physicalCount !== "" && Number(physicalCount) >= 0;

  return (
    <div className="space-y-4 pt-2">
      <Select
        label="Currency"
        data={rows.map((r) => ({ value: r.currency, label: r.currency }))}
        value={currency}
        onChange={setCurrency}
        allowDeselect={false}
      />
      <TextInput
        label="System Closing Balance"
        readOnly
        value={selected ? formatMoney(selected.systemClosingBalance, selected.currency) : ""}
        classNames={{ input: "bg-gray-50!" }}
      />
      <NumberInput
        label="Physical Count"
        placeholder="Enter counted amount"
        prefix={selected ? getCurrencySymbol(selected.currency) : undefined}
        thousandSeparator=","
        min={0}
        hideControls
        value={physicalCount}
        onChange={setPhysicalCount}
      />
      <Textarea
        label="Add Notes (Optional)"
        placeholder="Add context for this variance, e.g. till discrepancy, unrecorded transfer..."
        minRows={3}
        autosize
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" color="gray" radius="xl" onClick={onClose}>
          Cancel
        </Button>
        <Button
          radius="xl"
          disabled={!canSubmit}
          onClick={() => currency && onSubmit(currency, Number(physicalCount), notes.trim())}
          className="bg-primary-400! hover:bg-primary-500!"
        >
          Save &amp; Reconcile
        </Button>
      </div>
    </div>
  );
}

export function ReconcileAccountModal({ opened, onClose, rows, onSubmit }: Readonly<Props>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      title={
        <div>
          <p className="text-lg font-semibold text-body-heading-300">Reconcile account</p>
          <p className="text-sm text-body-text-50">Enter today’s physical cash count</p>
        </div>
      }
      closeButtonProps={{ icon: <X size={16} /> }}
    >
      <ReconcileForm onClose={onClose} rows={rows} onSubmit={onSubmit} />
    </Modal>
  );
}
