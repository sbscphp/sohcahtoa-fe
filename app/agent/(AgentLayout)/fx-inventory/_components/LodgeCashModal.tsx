"use client";

import { useState } from "react";
import { Button, Modal, NumberInput, Select, Textarea, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { getCurrencySymbol } from "@/app/(customer)/_lib/currency";
import { formatLocalDate } from "@/app/utils/helper/formatLocalDate";

interface Props {
  opened: boolean;
  onClose: () => void;
  currencies: string[];
  defaultCurrency?: string;
  isPending: boolean;
  onSubmit: (currency: string, amount: number, notes: string) => void;
}

/** Mounted only while the modal is open, so its state resets on every open. */
function LodgeCashForm({
  onClose,
  currencies,
  defaultCurrency,
  isPending,
  onSubmit,
}: Readonly<Omit<Props, "opened">>) {
  const [currency, setCurrency] = useState<string | null>(
    defaultCurrency && currencies.includes(defaultCurrency) ? defaultCurrency : (currencies[0] ?? null),
  );
  const [amount, setAmount] = useState<number | string>("");
  const [notes, setNotes] = useState("");
  // Captured once per open: the lodgment is stamped by the server, this is display only.
  const [now] = useState(() => new Date());

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
        label="Amount being returned"
        placeholder="Enter amount"
        prefix={currency ? getCurrencySymbol(currency) : undefined}
        thousandSeparator=","
        min={0}
        hideControls
        value={amount}
        onChange={setAmount}
      />
      <Textarea
        label="Reference / Notes"
        placeholder="e.g. end-of-day cash return..."
        minRows={2}
        autosize
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />
      <TextInput
        label="Date & Time"
        readOnly
        value={`Today · ${formatLocalDate(now, "dd MMM yyyy, hh:mm a")}`}
        classNames={{ input: "bg-gray-50!" }}
      />
      <p className="text-xs text-body-text-100">
        Submitting this won’t change your available inventory yet — HQ needs to confirm receipt first. Until then it’ll
        show as “Pending Verification.”
      </p>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" color="gray" radius="xl" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          radius="xl"
          loading={isPending}
          disabled={!canSubmit}
          onClick={() => currency && onSubmit(currency, Number(amount), notes.trim())}
          className="bg-primary-400! hover:bg-primary-500!"
        >
          Submit Lodgment Request
        </Button>
      </div>
    </div>
  );
}

export function LodgeCashModal({ opened, onClose, ...rest }: Readonly<Props>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      title={
        <div>
          <p className="text-lg font-semibold text-body-heading-300">Lodge Cash to HQ</p>
          <p className="text-sm text-body-text-50">Return foreign currency or NGN cash to the BDC</p>
        </div>
      }
      closeButtonProps={{ icon: <X size={16} /> }}
    >
      <LodgeCashForm onClose={onClose} {...rest} />
    </Modal>
  );
}
