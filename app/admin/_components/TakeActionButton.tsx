"use client";

import { Button, Menu } from "@mantine/core";
import { useState } from "react";
import TakeActionOverlay from "../(AdminLayout)/transactions/[id]/TakeActionOverlay";
import type {
  TransactionActionDocumentViewModel,
  TransactionWorkflowHistoryItemViewModel,
  PendingWorkflowStageViewModel,
} from "../(AdminLayout)/transactions/[id]/hooks/useTransactionDetails";
import { ConfirmationModal } from "./ConfirmationModal";
import { SuccessModal } from "./SuccessModal";

type DisbursementConfirmType = "initiate" | "confirm";

interface TakeActionButtonProps {
  /** Button text - defaults to "Take Action" */
  label?: string;
  /** Button size - defaults to "md" */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Button variant - defaults to "filled" */
  variant?: "filled" | "outline" | "light" | "subtle";
  /** Custom color - defaults to "#DD4F05" */
  color?: string;
  /** Additional className */
  className?: string;
  /** Callback when overlay opens */
  onOpen?: () => void;
  /** Callback when overlay closes */
  onClose?: () => void;
  transactionId?: string;
  /** Raw transaction status code used for disbursement menu gating */
  transactionStatus?: string;
  transactionStatusLabel?: string;
  documents?: TransactionActionDocumentViewModel[];
  workflowHistory?: TransactionWorkflowHistoryItemViewModel[];
  pendingWorkflowStages?: PendingWorkflowStageViewModel[];
  /** When false, transaction-level footer actions (Complete Review / Take Action) are hidden. Default true (legacy). */
  canActOnTransactionFooter?: boolean;
  /** When true, per-document approval actions are shown (independent of assignee check). Default false. */
  isApprovalOfficer?: boolean;
  approvalState?: string;
  approvalProcessName?: string;
  approvalType?: string;
}

const INITIATE_CONFIRM = {
  title: "Initiate Disbursement?",
  message:
    "Are you sure you want to initiate disbursement for this transaction?",
  primaryButtonText: "Yes, Initiate Disbursement",
} as const;

const CONFIRM_DISBURSEMENT = {
  title: "Confirm Disbursement?",
  message:
    "Are you sure you want to confirm disbursement for this transaction? This action can not be undone.",
  primaryButtonText: "Yes, Confirm Disbursement",
} as const;

const INITIATE_SUCCESS = {
  title: "Disbursement Initiated",
  message: "Disbursement has been initiated successfully.",
  primaryButtonText: "Close",
} as const;

const CONFIRM_SUCCESS = {
  title: "Disbursement Successful",
  message: "Funds disbursed successfully!",
  primaryButtonText: "Close",
} as const;

export default function TakeActionButton({
  label = "Take Action",
  size = "md",
  variant = "filled",
  color = "#DD4F05",
  className,
  onOpen,
  onClose,
  transactionId,
  transactionStatus,
  transactionStatusLabel,
  documents = [],
  workflowHistory = [],
  pendingWorkflowStages = [],
  canActOnTransactionFooter = true,
  isApprovalOfficer = false,
  approvalState,
  approvalProcessName,
  approvalType,
}: TakeActionButtonProps) {
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<DisbursementConfirmType | null>(
    null,
  );
  const [successType, setSuccessType] = useState<DisbursementConfirmType | null>(
    null,
  );

  const normalizedStatus = transactionStatus?.trim().toUpperCase() ?? "";
  const canInitiateDisbursement = normalizedStatus === "AWAITING_DISBURSEMENT";
  const canConfirmDisbursement =
    normalizedStatus === "DISBURSEMENT_IN_PROGRESS";

  const handleOpenApprovals = () => {
    setApprovalsOpen(true);
    onOpen?.();
  };

  const handleCloseApprovals = () => {
    setApprovalsOpen(false);
    onClose?.();
  };

  const handleConfirmPrimary = () => {
    if (!confirmType) return;
    setSuccessType(confirmType);
    setConfirmType(null);
  };

  const handleCloseConfirm = () => {
    setConfirmType(null);
  };

  const handleCloseSuccess = () => {
    setSuccessType(null);
  };

  const confirmProps =
    confirmType === "initiate"
      ? INITIATE_CONFIRM
      : confirmType === "confirm"
        ? CONFIRM_DISBURSEMENT
        : null;

  const successProps =
    successType === "initiate"
      ? INITIATE_SUCCESS
      : successType === "confirm"
        ? CONFIRM_SUCCESS
        : null;

  return (
    <>
      <Menu position="bottom-end" shadow="md" width={220}>
        <Menu.Target>
          <Button
            color={color}
            radius="xl"
            size={size}
            variant={variant}
            className={className}
          >
            {label}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={handleOpenApprovals}>View Approvals</Menu.Item>
          {canInitiateDisbursement && (
            <Menu.Item onClick={() => setConfirmType("initiate")}>
              Initiate Disbursement
            </Menu.Item>
          )}
          {canConfirmDisbursement && (
            <Menu.Item onClick={() => setConfirmType("confirm")}>
              Confirm Disbursement
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      <TakeActionOverlay
        opened={approvalsOpen}
        onClose={handleCloseApprovals}
        transactionId={transactionId}
        transactionStatusLabel={transactionStatusLabel}
        documents={documents}
        workflowHistory={workflowHistory}
        pendingWorkflowStages={pendingWorkflowStages}
        canActOnTransactionFooter={canActOnTransactionFooter}
        isApprovalOfficer={isApprovalOfficer}
        approvalState={approvalState}
        approvalProcessName={approvalProcessName}
        approvalType={approvalType}
      />

      {confirmProps && (
        <ConfirmationModal
          opened={confirmType !== null}
          onClose={handleCloseConfirm}
          title={confirmProps.title}
          message={confirmProps.message}
          primaryButtonText={confirmProps.primaryButtonText}
          onPrimary={handleConfirmPrimary}
        />
      )}

      {successProps && (
        <SuccessModal
          opened={successType !== null}
          onClose={handleCloseSuccess}
          title={successProps.title}
          message={successProps.message}
          primaryButtonText={successProps.primaryButtonText}
          onPrimaryClick={handleCloseSuccess}
        />
      )}
    </>
  );
}
