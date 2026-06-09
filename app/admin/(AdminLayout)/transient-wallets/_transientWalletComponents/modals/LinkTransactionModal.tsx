"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  Text,
  TextInput,
  Loader,
  Stack,
  Paper,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Search, X } from "lucide-react";
import {
  useTransactionSearch,
} from "../../hooks/useTransientWalletEntryDetails";
import type { AdminTransactionSearchItem } from "@/app/admin/_services/admin-api";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

interface LinkTransactionModalProps {
  opened: boolean;
  onClose: () => void;
  walletId: string;
  entryId: string;
  onConfirmLink: (transactionId: string) => void;
  loading?: boolean;
}

function formatTransactionLabel(tx: AdminTransactionSearchItem): string {
  return `${tx.dateAndId.reference} — ${tx.customerName}`;
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
  const [selected, setSelected] = useState<AdminTransactionSearchItem | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { results, isLoading: isSearching } = useTransactionSearch(debouncedSearch);

  const resetState = () => {
    setStep(1);
    setSearch("");
    setSelected(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSelect = (tx: AdminTransactionSearchItem) => {
    setSelected(tx);
    setSearch(formatTransactionLabel(tx));
    setStep(2);
  };

  const handleConfirm = () => {
    if (!selected) return;
    onConfirmLink(selected.id);
  };

  const displayEntryId = `TW-${entryId.slice(0, 8).toUpperCase()}`;
  const showResults = step === 1 && debouncedSearch.trim().length >= 3;
  const showMinLengthHint = step === 1 && search.trim().length > 0 && search.trim().length < 3;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        {step === 1 ? (
          <div>
            <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
              Search for transaction to link{" "}
              <span className="text-red-500">*</span>
            </Text>
            <TextInput
              placeholder="Search by transaction ref or customer name"
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setSelected(null);
              }}
              rightSection={
                isSearching ? <Loader size={16} /> : <Search size={16} color="#DD4F05" />
              }
              radius="md"
              disabled={loading}
            />

            {showMinLengthHint && (
              <Text size="xs" c="dimmed" mt={6}>
                Type at least 3 characters to search
              </Text>
            )}

            {showResults && !isSearching && results.length === 0 && (
              <Text size="xs" c="dimmed" mt={6}>
                No transactions found matching your search.
              </Text>
            )}

            {showResults && results.length > 0 && (
              <Stack gap={4} mt={8}>
                {results.map((tx) => (
                  <Paper
                    key={tx.id}
                    withBorder
                    radius="md"
                    p="sm"
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelect(tx)}
                  >
                    <Text size="sm" fw={500}>
                      {tx.dateAndId.reference}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {tx.customerName} &bull; {tx.transactionType} &bull;{" "}
                      {formatCurrency(tx.transactionValue)} {tx.currency}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </div>
        ) : (
          <>
            <div>
              <Text size="sm" fw={500} className="text-body-heading-300! mb-1">
                Transaction to link{" "}
                <span className="text-red-500">*</span>
              </Text>
              <TextInput
                value={selected ? formatTransactionLabel(selected) : ""}
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

            {selected && (
              <div className="rounded-xl border border-[#EEA782] bg-[#FFF6F1] p-4">
                <Text size="sm" fw={600} className="text-[#F63D68]! mb-1">
                  Kindly note:
                </Text>
                <Text size="sm" className="text-body-text-100!">
                  By clicking{" "}
                  <strong>CONFIRM LINK</strong>,{" "}
                  <strong>{formatTransactionLabel(selected)}</strong> will be{" "}
                  <strong>MATCHED</strong> to entry{" "}
                  <strong>{displayEntryId}</strong>. This action will update
                  the entry status to MATCHED.
                </Text>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button
          radius="xl"
          variant="outline"
          color="gray"
          onClick={handleClose}
          disabled={loading}
          className="border-text-50! font-semibold!"
        >
          Close
        </Button>
        {step === 2 && (
          <Button
            radius="xl"
            color="#DD4F05"
            loading={loading}
            onClick={handleConfirm}
            disabled={loading || !selected}
            className="font-medium!"
          >
            Confirm Link
          </Button>
        )}
      </div>
    </Modal>
  );
}
