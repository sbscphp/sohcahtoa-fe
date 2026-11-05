"use client";

import { useState } from "react";
import { Button, Modal, NumberInput, Select, Textarea } from "@mantine/core";
import { X } from "lucide-react";
import { getCurrencySymbol } from "@/app/(customer)/_lib/currency";

interface Props {
  opened: boolean;
  onClose: () => void;
  currencies: string[];
  defaultCurrency?: string;
  onSubmit: (currency: string, amount: number, notes: string) => void;
}

/** Mounted only while the modal is open, so its state resets on every open. */
function LodgeCashForm({ onClose, currencies, defaultCurrency, onSubmit }: Readonly<Omit<Props, "opened">>) {
  const [currency, setCurrency] = useState<string | null>(
    defaultCurrency && currencies.includes(defaultCurrency) ? defaultCurrency : (currencies[0] ?? null),
  );
  const [amount, setAmount] = useState<number | string>("");
  const [notes, setNotes] = useState("");

  const canSubmit = currency != null && Number(amount) > 0;

  return (
    <div className="space-y-4 pt-2">
      <Select
        label="Currency"
        data={currencies.map((c) => ({ value: c, label: c }))}
        value={currency}
        onChange={setCurrency}
        allowDeselect={false}
      />
      <NumberInput
        label="Amount"
        placeholder="Enter amount to lodge"
        prefix={currency ? getCurrencySymbol(currency) : undefined}
        thousandSeparator=","
        min={0}
        hideControls
        value={amount}
        onChange={setAmount}
      />
      <Textarea
        label="Reference / Notes (Optional)"
        placeholder="Add a reference or note for HQ..."
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
          onClick={() => currency && onSubmit(currency, Number(amount), notes.trim())}
          className="bg-primary-400! hover:bg-primary-500!"
        >
          Lodge Cash
        </Button>
      </div>
    </div>
  );
}

export function LodgeCashModal({ opened, onClose, currencies, defaultCurrency, onSubmit }: Readonly<Props>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      title={
        <div>
          <p className="text-lg font-semibold text-body-heading-300">Lodge cash</p>
          <p className="text-sm text-body-text-50">Submit cash you are returning to HQ for verification</p>
        </div>
      }
      closeButtonProps={{ icon: <X size={16} /> }}
    >
      <LodgeCashForm
        onClose={onClose}
        currencies={currencies}
        defaultCurrency={defaultCurrency}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
