"use client";

import { Button } from "@mantine/core";
import { useState } from "react";
import TakeActionOverlay from "../(AdminLayout)/transactions/[id]/TakeActionOverlay";
import type {
  TransactionActionDocumentViewModel,
  TransactionWorkflowHistoryItemViewModel,
  PendingWorkflowStageViewModel,
} from "../(AdminLayout)/transactions/[id]/hooks/useTransactionDetails";

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
  /** Raw transaction status code used for confirm-disbursement menu gating */
  transactionStatus?: string;
  /** Raw workflow stage code used for confirm-disbursement footer gating */
  workflowStage?: string;
  transactionStatusLabel?: string;
  documents?: TransactionActionDocumentViewModel[];
  workflowHistory?: TransactionWorkflowHistoryItemViewModel[];
  pendingWorkflowStages?: PendingWorkflowStageViewModel[];
  disbursementWorkflowStages?: PendingWorkflowStageViewModel[];
  /** When false, transaction-level footer actions (Complete Review / Take Action) are hidden. Default true (legacy). */
  canActOnTransactionFooter?: boolean;
  /** When true, per-document approval actions are shown (independent of assignee check). Default false. */
  isApprovalOfficer?: boolean;
  approvalState?: string;
  approvalProcessName?: string;
  approvalType?: string;
  isLastWorkflowStage?: boolean;
}

export default function TakeActionButton({
  label,
  size = "md",
  variant = "filled",
  color = "#DD4F05",
  className,
  onOpen,
  onClose,
  transactionId,
  workflowStage,
  transactionStatusLabel,
  documents = [],
  workflowHistory = [],
  pendingWorkflowStages = [],
  disbursementWorkflowStages = [],
  canActOnTransactionFooter = true,
  isApprovalOfficer = false,
  approvalState,
  approvalProcessName,
  approvalType,
  isLastWorkflowStage = false,
}: TakeActionButtonProps) {
  const [approvalsOpen, setApprovalsOpen] = useState(false);

  const handleOpenApprovals = () => {
    setApprovalsOpen(true);
    onOpen?.();
  };

  const handleCloseApprovals = () => {
    setApprovalsOpen(false);
    onClose?.();
  };

  return (
    <>
      <Button
        color={color}
        radius="xl"
        size={size}
        variant={variant}
        className={className}
        onClick={handleOpenApprovals}
      >
        {label ?? (transactionStatusLabel === "Pending" ? "Take Action" : "View Approvals") }
      </Button>

      <TakeActionOverlay
        opened={approvalsOpen}
        onClose={handleCloseApprovals}
        transactionId={transactionId}
        workflowStage={workflowStage}
        transactionStatusLabel={transactionStatusLabel}
        documents={documents}
        workflowHistory={workflowHistory}
        pendingWorkflowStages={pendingWorkflowStages}
        disbursementWorkflowStages={disbursementWorkflowStages}
        canActOnTransactionFooter={canActOnTransactionFooter}
        isApprovalOfficer={isApprovalOfficer}
        approvalState={approvalState}
        approvalProcessName={approvalProcessName}
        approvalType={approvalType}
        isLastWorkflowStage={isLastWorkflowStage}
      />
    </>
  );
}
