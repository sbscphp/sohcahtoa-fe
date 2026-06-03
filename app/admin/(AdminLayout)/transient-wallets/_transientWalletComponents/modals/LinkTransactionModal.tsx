"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Text, Textarea, TextInput, Autocomplete } from "@mantine/core";
import { Search, X } from "lucide-react";
import {
  MOCK_LINKABLE_TRANSACTIONS,
  formatLinkableTransactionLabel,
  type LinkableTransaction,
} from "../../hooks/mockData";

const MAX_REASON_LENGTH = 100;

interface LinkTransactionModalProps {
  opened: boolean;
  onClose: () => void;
  entryId: string;
  onConfirmLink: (transaction: LinkableTransaction, reason: string) => void;
  loading?: boolean;
}

export default function LinkTransactionModal({
  opened,
  onClose,
  entryId,
  onConfirmLink,
  loading = false,
}: LinkTransactionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LinkableTransaction | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!opened) {
      setStep(1);
      setSearch("");
      setSelected(null);
      setReason("");
    }
  }, [opened]);

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? MOCK_LINKABLE_TRANSACTIONS.filter((tx) =>
          formatLinkableTransactionLabel(tx).toLowerCase().includes(q)
        )
      : MOCK_LINKABLE_TRANSACTIONS;
    return filtered.map(formatLinkableTransactionLabel);
  }, [search]);

  const handleSelect = (value: string) => {
    setSearch(value);
    const match = MOCK_LINKABLE_TRANSACTIONS.find(
      (tx) => formatLinkableTransactionLabel(tx) === value
    );
    setSelected(match ?? null);
  };

  const handleLinkClick = () => {
    if (!selected || !reason.trim()) return;
    setStep(2);
  };

  const handleConfirm = () => {
    if (!selected || !reason.trim()) return;
    onConfirmLink(selected, reason.trim());
  };

  const displayEntryId = `TW-${entryId.padStart(4, "0")}`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="lg"
      withCloseButton={false}
      padding={0}
    >
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <Text className="text-body-heading-300! text-xl! font-bold!">
            Link Transaction
          </Text>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        {step === 1 ? (
          <>
            <div>
              <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
                Search for transaction to link{" "}
                <span className="text-red-500">*</span>
              </Text>
              <Autocomplete
                placeholder="Search by transaction ref no or name of customer"
                value={search}
                onChange={setSearch}
                onOptionSubmit={handleSelect}
                data={options}
                rightSection={<Search size={16} color="#DD4F05" />}
                radius="md"
                disabled={loading}
              />
            </div>
            <div>
              <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
                Reason for matching <span className="text-red-500">*</span>
              </Text>
              <Textarea
                placeholder="Enter reason for matching this transaction"
                value={reason}
                onChange={(e) =>
                  setReason(e.currentTarget.value.slice(0, MAX_REASON_LENGTH))
                }
                minRows={4}
                radius="md"
                disabled={loading}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Not more than {MAX_REASON_LENGTH} character counts
              </Text>
            </div>
          </>
        ) : (
          <>
            <div>
              <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
                Enter transaction to link{" "}
                <span className="text-red-500">*</span>
              </Text>
              <TextInput
                value={
                  selected ? formatLinkableTransactionLabel(selected) : ""
                }
                readOnly
                radius="md"
                rightSection={
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setSearch("");
                      setStep(1);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                }
              />
            </div>
            <div>
              <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
                Reason for matching <span className="text-red-500">*</span>
              </Text>
              <Textarea
                placeholder="Enter reason for matching this transaction"
                value={reason}
                onChange={(e) =>
                  setReason(e.currentTarget.value.slice(0, MAX_REASON_LENGTH))
                }
                minRows={4}
                radius="md"
                disabled={loading}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Not more than {MAX_REASON_LENGTH} character counts
              </Text>
            </div>
            {selected ? (
              <div className="rounded-xl border border-[#EEA782] bg-[#FFF6F1] p-4">
                <Text size="sm" fw={600} className="text-[#F63D68]! mb-1">
                  Kindly note:
                </Text>
                <Text size="sm" className="text-body-text-100!">
                  By clicking CONFIRM LINK,{" "}
                  <strong>{formatLinkableTransactionLabel(selected)}</strong>{" "}
                  will be <strong>MATCHED</strong> to entry{" "}
                  <strong>{displayEntryId}</strong>. This action will update
                  the entry status to MATCHED.
                </Text>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button
          radius="xl"
          variant="outline"
          color="gray"
          onClick={onClose}
          disabled={loading}
          className="border-text-50! font-semibold!"
        >
          Close
        </Button>
        {step === 1 ? (
          <Button
            radius="xl"
            color="#DD4F05"
            onClick={handleLinkClick}
            disabled={loading || !selected || !reason.trim()}
            className="font-medium!"
          >
            Link
          </Button>
        ) : (
          <Button
            radius="xl"
            color="#DD4F05"
            loading={loading}
            onClick={handleConfirm}
            disabled={loading || !selected || !reason.trim()}
            className="font-medium!"
          >
            Confirm Link
          </Button>
        )}
      </div>
    </Modal>
  );
}
