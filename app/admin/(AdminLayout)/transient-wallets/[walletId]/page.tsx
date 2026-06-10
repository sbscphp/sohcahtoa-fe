"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import WalletSummaryCard from "../_transientWalletComponents/WalletSummaryCard";
import WalletLedgerTable from "../_transientWalletComponents/WalletLedgerTable";
import AddNoteToEntryModal from "../_transientWalletComponents/modals/AddNoteToEntryModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { useTransientWalletDetails } from "../hooks/useTransientWalletDetails";

export default function TransientWalletDetailPage() {
  const params = useParams<{ walletId: string }>();
  const walletId = params?.walletId ?? "";
  const { wallet, isLoading, isError } = useTransientWalletDetails(walletId);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteSuccessOpen, setNoteSuccessOpen] = useState(false);

  const handleNoteSubmit = () => {
    setNoteModalOpen(false);
    setNoteSuccessOpen(true);
  };

  if (!isLoading && isError) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-lg font-semibold text-gray-900">Wallet not found</p>
        <p className="mt-2 text-sm text-gray-500">
          Please return to the transient wallets list and select a valid wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WalletSummaryCard
        wallet={wallet}
        isLoading={isLoading}
        showAddNote={false}
        onAddNote={() => setNoteModalOpen(true)}
      />

      <WalletLedgerTable walletId={walletId} />

      <AddNoteToEntryModal
        opened={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleNoteSubmit}
      />

      <SuccessModal
        opened={noteSuccessOpen}
        onClose={() => setNoteSuccessOpen(false)}
        title="Note Added to Entry"
        message="Your notes have been logged in this entry"
        primaryButtonText="Close"
        onPrimaryClick={() => setNoteSuccessOpen(false)}
      />
    </div>
  );
}
