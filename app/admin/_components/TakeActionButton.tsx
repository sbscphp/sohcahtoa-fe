"use client";

import { Button, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";
import TakeActionOverlay from "../(AdminLayout)/transactions/[id]/TakeActionOverlay";
import type {
  TransactionActionDocumentViewModel,
  TransactionWorkflowHistoryItemViewModel,
  PendingWorkflowStageViewModel,
} from "../(AdminLayout)/transactions/[id]/hooks/useTransactionDetails";
import { ConfirmationModal } from "./ConfirmationModal";
import { ConfirmDisbursementModal } from "./ConfirmDisbursementModal";
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
  /** Raw transaction status code used for confirm-disbursement menu gating */
  transactionStatus?: string;
  /** Raw workflow stage code used for initiate-disbursement menu gating */
  workflowStage?: string;
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
  isLastWorkflowStage?: boolean;
}

const INITIATE_CONFIRM = {
  title: "Initiate Disbursement?",
  message:
    "Are you sure you want to initiate disbursement for this transaction?",
  primaryButtonText: "Yes, Initiate Disbursement",
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
  // transactionStatus,
  workflowStage,
  transactionStatusLabel,
  documents = [],
  workflowHistory = [],
  pendingWorkflowStages = [],
  canActOnTransactionFooter = true,
  isApprovalOfficer = false,
  approvalState,
  approvalProcessName,
  approvalType,
  isLastWorkflowStage = false,
}: TakeActionButtonProps) {
  const queryClient = useQueryClient();
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<DisbursementConfirmType | null>(
    null,
  );
  const [successType, setSuccessType] = useState<DisbursementConfirmType | null>(
    null,
  );

  const canInitiateDisbursement =
    workflowStage?.trim().toUpperCase() === "DEPOSIT_CONFIRMED";
  const canConfirmDisbursement =
    workflowStage?.trim().toUpperCase() === "DISBURSEMENT_APPROVED";

  const handleMutationError = (error: Error, defaultMessage: string) => {
    const apiResponse = (error as unknown as ApiError).data as
      | ApiResponse
      | undefined;
    notifications.show({
      color: "red",
      title: "Action failed",
      message: apiResponse?.error?.message ?? error.message ?? defaultMessage,
    });
  };

  const invalidateTransactionQueries = async () => {
    if (!transactionId) return;
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: adminKeys.transactions.detail(transactionId),
      }),
      queryClient.invalidateQueries({
        queryKey: adminKeys.transactions.lists(),
      }),
    ]);
  };

  const initiateDisbursementMutation = useCreateData(
    (id: string) => adminApi.transactions.initiateDisbursement(id),
    {
      onSuccess: async () => {
        await invalidateTransactionQueries();
        setConfirmType(null);
        setSuccessType("initiate");
      },
      onError: (error) =>
        handleMutationError(error, "Unable to initiate disbursement."),
    },
  );

  const confirmDisbursementMutation = useCreateData(
    ({ id, sessionId }: { id: string; sessionId: string }) =>
      adminApi.transactions.confirmDisbursement(id, { sessionId }),
    {
      onSuccess: async () => {
        await invalidateTransactionQueries();
        setConfirmType(null);
        setSuccessType("confirm");
      },
      onError: (error) =>
        handleMutationError(error, "Unable to confirm disbursement."),
    },
  );

  const isConfirmLoading =
    initiateDisbursementMutation.isPending ||
    confirmDisbursementMutation.isPending;

  const handleOpenApprovals = () => {
    setApprovalsOpen(true);
    onOpen?.();
  };

  const handleCloseApprovals = () => {
    setApprovalsOpen(false);
    onClose?.();
  };

  const handleInitiateConfirm = () => {
    if (!transactionId || isConfirmLoading) return;
    initiateDisbursementMutation.mutate(transactionId);
  };

  const handleConfirmDisbursement = (sessionId: string) => {
    if (!transactionId || isConfirmLoading) return;
    confirmDisbursementMutation.mutate({ id: transactionId, sessionId });
  };

  const handleCloseConfirm = () => {
    if (isConfirmLoading) return;
    setConfirmType(null);
  };

  const handleCloseSuccess = () => {
    setSuccessType(null);
  };

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
        isLastWorkflowStage={isLastWorkflowStage}
      />

      <ConfirmationModal
        opened={confirmType === "initiate"}
        onClose={handleCloseConfirm}
        title={INITIATE_CONFIRM.title}
        message={INITIATE_CONFIRM.message}
        primaryButtonText={INITIATE_CONFIRM.primaryButtonText}
        onPrimary={handleInitiateConfirm}
        loading={initiateDisbursementMutation.isPending}
      />

      <ConfirmDisbursementModal
        opened={confirmType === "confirm"}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDisbursement}
        isLoading={confirmDisbursementMutation.isPending}
      />

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
