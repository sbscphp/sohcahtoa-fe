"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Group, Text, Divider, Tabs } from "@mantine/core";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import { adminRoutes } from "@/lib/adminRoutes";
import { useTransientWalletEntryDetails } from "../../../hooks/useTransientWalletEntryDetails";
import EntryAuditLogsTab from "../../../_transientWalletComponents/EntryAuditLogsTab";
import EntryAdminNotesTab from "../../../_transientWalletComponents/EntryAdminNotesTab";
import AddNoteToEntryModal from "../../../_transientWalletComponents/modals/AddNoteToEntryModal";
import LinkTransactionModal from "../../../_transientWalletComponents/modals/LinkTransactionModal";
import FlagEntryModal from "../../../_transientWalletComponents/modals/FlagEntryModal";
import TakeActionMenu, {
  type TakeActionType,
} from "../../../_transientWalletComponents/modals/TakeActionMenu";
import type { LinkableTransaction } from "../../../hooks/mockData";

type SuccessVariant =
  | "note"
  | "matched"
  | "flagged"
  | "refund"
  | "disbursement"
  | null;

export default function TransientWalletEntryDetailPage() {
  const router = useRouter();
  const params = useParams<{ walletId: string; entryId: string }>();
  const walletId = params?.walletId ?? "";
  const entryId = params?.entryId ?? "";

  const { entry, isLoading } = useTransientWalletEntryDetails(
    walletId,
    entryId
  );

  const isUnmatched = entry?.status === "Unmatched";

  const [activeTab, setActiveTab] = useState<"audit" | "notes">("audit");

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  const [confirmType, setConfirmType] = useState<
    "flag" | "refund" | "disburse" | null
  >(null);
  const [successVariant, setSuccessVariant] = useState<SuccessVariant>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleTakeAction = (action: TakeActionType) => {
    switch (action) {
      case "link":
        setLinkModalOpen(true);
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

  const handleNoteSubmit = () => {
    setNoteModalOpen(false);
    setSuccessVariant("note");
  };

  const handleLinkConfirm = (_tx: LinkableTransaction, _reason: string) => {
    setLinkModalOpen(false);
    setSuccessVariant("matched");
  };

  const handleFlagSubmit = (_reason: string, _description: string) => {
    setFlagModalOpen(false);
    setConfirmType("flag");
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setActionLoading(false);

    if (confirmType === "flag") {
      setConfirmType(null);
      setSuccessVariant("flagged");
    } else if (confirmType === "refund") {
      setConfirmType(null);
      setSuccessVariant("refund");
    } else if (confirmType === "disburse") {
      setConfirmType(null);
      setSuccessVariant("disbursement");
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

  const getConfirmModalProps = () => {
    switch (confirmType) {
      case "flag":
        return {
          title: "Flag Entry ?",
          message: `Are you sure you want to flag entry ${entryId}? Flagged entries will be escalated immediately for further actions.`,
          primaryButtonText: "Yes, Flag Entry",
          primaryColor: "red",
        };
      case "refund":
        return {
          title: "Initiate Refund ?",
          message:
            "Are you sure you want to initiate a refund for this transaction? A refund workflow will be triggered for this entry. Entry will be updated to REFUND PENDING status.",
          primaryButtonText: "Yes, Initiate Refund",
          primaryColor: "orange",
        };
      case "disburse":
        return {
          title: "Confirm Disbursement ?",
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
              {isUnmatched ? (
                <TakeActionMenu onAction={handleTakeAction} />
              ) : null}
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
                label="Virtual Account No."
                value={entry?.virtualAccountNo ?? "—"}
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
          onChange={(value) => setActiveTab((value as "audit" | "notes") ?? "audit")}
        >
          <Tabs.List className="mb-4 border-0! before:content-none!">
            <AdminTabButton value="audit">Audit logs</AdminTabButton>
            <AdminTabButton value="notes">Admin Notes</AdminTabButton>
          </Tabs.List>

          <Tabs.Panel value="audit">
            <EntryAuditLogsTab entryId={entryId} />
          </Tabs.Panel>
          <Tabs.Panel value="notes">
            <EntryAdminNotesTab entryId={entryId} />
          </Tabs.Panel>
        </Tabs>
      </div>

      <AddNoteToEntryModal
        opened={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleNoteSubmit}
      />

      <LinkTransactionModal
        opened={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        entryId={entryId}
        onConfirmLink={handleLinkConfirm}
        loading={actionLoading}
      />

      <FlagEntryModal
        opened={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSubmit={handleFlagSubmit}
        loading={actionLoading}
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
          loading={actionLoading}
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
