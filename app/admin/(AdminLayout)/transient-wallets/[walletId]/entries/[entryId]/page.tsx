"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { Group, Text, Divider, Tabs } from "@mantine/core";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import { adminRoutes } from "@/lib/adminRoutes";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useTransientWalletEntryDetails } from "../../../hooks/useTransientWalletEntryDetails";
import { normalizeMatchStatus } from "../../../hooks/walletUtils";
import EntryAuditLogsTab from "../../../_transientWalletComponents/EntryAuditLogsTab";
import EntryAdminNotesTab from "../../../_transientWalletComponents/EntryAdminNotesTab";
import AddNoteToEntryModal from "../../../_transientWalletComponents/modals/AddNoteToEntryModal";
import LinkTransactionModal from "../../../_transientWalletComponents/modals/LinkTransactionModal";
import FlagEntryModal from "../../../_transientWalletComponents/modals/FlagEntryModal";
import TakeActionMenu, {
  type TakeActionType,
} from "../../../_transientWalletComponents/modals/TakeActionMenu";

type SuccessVariant =
  | "note"
  | "matched"
  | "unmatched"
  | "flagged"
  | "refund"
  | "disbursement"
  | null;

function showErrorToast(error: Error, defaultMessage: string) {
  const apiResponse = (error as unknown as ApiError).data as
    | ApiResponse
    | undefined;
  notifications.show({
    color: "red",
    title: "Action failed",
    message:
      apiResponse?.error?.message ?? error.message ?? defaultMessage,
  });
}

export default function TransientWalletEntryDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ walletId: string; entryId: string }>();
  const walletId = params?.walletId ?? "";
  const entryId = params?.entryId ?? "";

  const { entry, isLoading } = useTransientWalletEntryDetails(
    walletId,
    entryId
  );

  const isMatched = normalizeMatchStatus(entry?.matchStatus ?? null) === "Matched";

  const [activeTab, setActiveTab] = useState<"audit" | "notes">("audit");

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  const [confirmType, setConfirmType] = useState<
    "unlink" | "refund" | "disburse" | null
  >(null);
  const [successVariant, setSuccessVariant] = useState<SuccessVariant>(null);

  const invalidateEntry = () =>
    queryClient.invalidateQueries({
      queryKey: adminKeys.wallet.ledgerEntry(walletId, entryId),
    });

  const invalidateNotes = () =>
    queryClient.invalidateQueries({
      queryKey: adminKeys.wallet.ledgerNotes(walletId, entryId),
    });

  // ==================== Mutations ====================

  const addNoteMutation = useCreateData(
    (note: string) => adminApi.wallet.addLedgerNote(walletId, entryId, { note }),
    {
      onSuccess: async () => {
        await invalidateNotes();
        setNoteModalOpen(false);
        setSuccessVariant("note");
      },
      onError: (error) => showErrorToast(error, "Unable to add note."),
    }
  );

  const linkMutation = useCreateData(
    ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      adminApi.wallet.linkTransaction(walletId, entryId, { transactionId, reason }),
    {
      onSuccess: async () => {
        await invalidateEntry();
        setLinkModalOpen(false);
        setSuccessVariant("matched");
      },
      onError: (error) => showErrorToast(error, "Unable to link transaction."),
    }
  );

  const unlinkMutation = useCreateData<unknown, void>(
    () => adminApi.wallet.unlinkTransaction(walletId, entryId),
    {
      onSuccess: async () => {
        await invalidateEntry();
        setConfirmType(null);
        setSuccessVariant("unmatched");
      },
      onError: (error) => showErrorToast(error, "Unable to unlink transaction."),
    }
  );

  const flagMutation = useCreateData(
    (reason: string) => adminApi.wallet.flagEntry(walletId, entryId, { reason }),
    {
      onSuccess: async () => {
        await invalidateEntry();
        setFlagModalOpen(false);
        setSuccessVariant("flagged");
      },
      onError: (error) => showErrorToast(error, "Unable to flag entry."),
    }
  );

  const refundMutation = useCreateData<unknown, void>(
    () => adminApi.wallet.refundEntry(walletId, entryId),
    {
      onSuccess: async () => {
        await invalidateEntry();
        setConfirmType(null);
        setSuccessVariant("refund");
      },
      onError: (error) => showErrorToast(error, "Unable to initiate refund."),
    }
  );

  const disburseMutation = useCreateData<unknown, void>(
    () => adminApi.wallet.disburseEntry(walletId, entryId),
    {
      onSuccess: async () => {
        await invalidateEntry();
        setConfirmType(null);
        setSuccessVariant("disbursement");
      },
      onError: (error) => showErrorToast(error, "Unable to confirm disbursement."),
    }
  );

  // ==================== Handlers ====================

  const handleTakeAction = (action: TakeActionType) => {
    switch (action) {
      case "link":
        setLinkModalOpen(true);
        break;
      case "unlink":
        setConfirmType("unlink");
        break;
      case "flag":
        setFlagModalOpen(true);
        break;
      case "refund":
        setConfirmType("refund");
        break;
      case "disburse":
        setConfirmType("disburse");
        break;
    }
  };

  const handleNoteSubmit = (note: string) => {
    addNoteMutation.mutate(note);
  };

  const handleLinkConfirm = (transactionId: string, reason: string) => {
    linkMutation.mutate({ transactionId, reason });
  };

  const handleFlagSubmit = (reason: string, description?: string) => {
    const fullReason = description?.trim()
      ? `${reason}: ${description.trim()}`
      : reason;
    flagMutation.mutate(fullReason);
  };

  const handleConfirm = () => {
    if (confirmType === "unlink") {
      unlinkMutation.mutate(undefined);
    } else if (confirmType === "refund") {
      refundMutation.mutate(undefined);
    } else if (confirmType === "disburse") {
      disburseMutation.mutate(undefined);
    }
  };

  const handleViewAllEntries = () => {
    setSuccessVariant(null);
    router.push(adminRoutes.adminTransientWalletDetails(walletId));
  };

  const handleGoToDashboard = () => {
    setSuccessVariant(null);
    router.push(adminRoutes.adminDashboard());
  };

  const isConfirmLoading =
    unlinkMutation.isPending ||
    refundMutation.isPending ||
    disburseMutation.isPending;

  const getConfirmModalProps = () => {
    switch (confirmType) {
      case "unlink":
        return {
          title: "Unlink Transaction?",
          message: `Are you sure you want to unlink this transaction from entry ${entryId.slice(0, 8).toUpperCase()}? The entry status will revert to UNMATCHED.`,
          primaryButtonText: "Yes, Unlink",
          primaryColor: "red",
        };
      case "refund":
        return {
          title: "Initiate Refund?",
          message:
            "Are you sure you want to initiate a refund for this transaction? A refund workflow will be triggered for this entry. Entry will be updated to REFUND PENDING status.",
          primaryButtonText: "Yes, Initiate Refund",
          primaryColor: "orange",
        };
      case "disburse":
        return {
          title: "Confirm Disbursement?",
          message:
            "Are you sure you want to confirm disbursement for this transaction? This action can not be undone.",
          primaryButtonText: "Yes, Confirm Disbursement",
          primaryColor: "red",
        };
      default:
        return null;
    }
  };

  const confirmProps = getConfirmModalProps();

  const getSuccessModalProps = () => {
    switch (successVariant) {
      case "note":
        return {
          title: "Note Added to Entry",
          message: "Your notes have been logged in this entry",
          primaryButtonText: "Close",
          secondaryButtonText: undefined,
          onPrimary: () => setSuccessVariant(null),
        };
      case "matched":
        return {
          title: "Transaction Matched",
          message:
            "This transaction has been successfully matched to an entry.",
          primaryButtonText: "View All Entries",
          secondaryButtonText: "No, Close",
          onPrimary: handleViewAllEntries,
        };
      case "unmatched":
        return {
          title: "Transaction Unlinked",
          message: "The transaction has been successfully unlinked from this entry.",
          primaryButtonText: "View All Entries",
          secondaryButtonText: "No, Close",
          onPrimary: handleViewAllEntries,
        };
      case "flagged":
        return {
          title: "Entry Flagged",
          message: "This entry has been flagged successfully!",
          primaryButtonText: "View All Entries",
          secondaryButtonText: "No, Close",
          onPrimary: handleViewAllEntries,
        };
      case "refund":
        return {
          title: "Entry Refund Initiated",
          message:
            "Once refund is confirmed, the transaction in the entry will be refunded back to the customer.",
          primaryButtonText: "View All Entries",
          secondaryButtonText: "No, Close",
          onPrimary: handleViewAllEntries,
        };
      case "disbursement":
        return {
          title: "Disbursement Successful",
          message: "Funds disbursed successfully!",
          primaryButtonText: "Go to Dashboard",
          secondaryButtonText: undefined,
          onPrimary: handleGoToDashboard,
          primaryButtonVariant: "outline" as const,
        };
      default:
        return null;
    }
  };

  const successProps = getSuccessModalProps();

  if (!isLoading && !entry) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <Text size="lg" fw={600} className="text-gray-900">
          Entry not found
        </Text>
        <Text size="sm" c="dimmed" mt="sm">
          Please return to the wallet ledger and select a valid entry.
        </Text>
        <CustomButton
          buttonType="primary"
          className="mt-4"
          onClick={() =>
            router.push(adminRoutes.adminTransientWalletDetails(walletId))
          }
        >
          Back to Wallet
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Text size="xl" fw={600} className="text-gray-900">
                TW: {entry?.entryId ?? "—"}
              </Text>
              <Group gap={8} className="flex-wrap text-sm text-gray-600">
                <span>
                  Entry Date: {entry?.entryDate ?? "—"} |{" "}
                  {entry?.entryTime ?? "—"}
                </span>
                {entry ? <StatusBadge status={entry.status} /> : null}
              </Group>
            </div>

            <Group gap="sm">
              <CustomButton
                buttonType="secondary"
                onClick={() => setNoteModalOpen(true)}
              >
                Add Note
              </CustomButton>
              <TakeActionMenu
                onAction={handleTakeAction}
                isMatched={isMatched}
              />
            </Group>
          </div>

          <Divider className="my-2" />

          <section className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                label="Entry ID"
                value={entry?.entryId ?? "—"}
                loading={isLoading}
              />
              <DetailItem
                label="Transaction Ref"
                value={entry?.transactionRef ?? "—"}
                loading={isLoading}
              />
              <DetailItem
                label="Session ID"
                value={entry?.sessionId ?? "—"}
                loading={isLoading}
              />
              <DetailItem
                label="Transaction Type"
                value={entry?.transactionType ?? "—"}
                loading={isLoading}
              />
            </div>
            <DetailItem
              label="Amount"
              value={entry ? formatCurrency(entry.amount) : "—"}
              loading={isLoading}
            />
          </section>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <Tabs
          color="orange"
          value={activeTab}
          onChange={(value) =>
            setActiveTab((value as "audit" | "notes") ?? "audit")
          }
        >
          <Tabs.List className="mb-4 border-0! before:content-none!">
            <AdminTabButton value="audit">Audit logs</AdminTabButton>
            <AdminTabButton value="notes">Admin Notes</AdminTabButton>
          </Tabs.List>

          <Tabs.Panel value="audit">
            <EntryAuditLogsTab entryId={entryId} />
          </Tabs.Panel>
          <Tabs.Panel value="notes">
            <EntryAdminNotesTab walletId={walletId} entryId={entryId} />
          </Tabs.Panel>
        </Tabs>
      </div>

      <AddNoteToEntryModal
        opened={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleNoteSubmit}
        loading={addNoteMutation.isPending}
      />

      <LinkTransactionModal
        opened={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        walletId={walletId}
        entryId={entryId}
        onConfirmLink={handleLinkConfirm}
        loading={linkMutation.isPending}
      />

      <FlagEntryModal
        opened={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSubmit={handleFlagSubmit}
        loading={flagMutation.isPending}
      />

      {confirmProps ? (
        <ConfirmationModal
          opened={confirmType !== null}
          onClose={() => setConfirmType(null)}
          title={confirmProps.title}
          message={confirmProps.message}
          primaryButtonText={confirmProps.primaryButtonText}
          primaryColor={confirmProps.primaryColor}
          secondaryButtonText="No, Close"
          onPrimary={handleConfirm}
          loading={isConfirmLoading}
        />
      ) : null}

      {successProps ? (
        <SuccessModal
          opened={successVariant !== null}
          onClose={() => setSuccessVariant(null)}
          title={successProps.title}
          message={successProps.message}
          primaryButtonText={successProps.primaryButtonText}
          primaryButtonVariant={successProps.primaryButtonVariant}
          onPrimaryClick={successProps.onPrimary}
          secondaryButtonText={successProps.secondaryButtonText}
          onSecondaryClick={() => setSuccessVariant(null)}
        />
      ) : null}
    </div>
  );
}
