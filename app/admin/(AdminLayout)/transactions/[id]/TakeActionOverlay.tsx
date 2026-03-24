"use client";

import {
  Drawer,
  Group,
  Text,
  Title,
  Button,
  Avatar,
  Tabs,
  Popover,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Connector from "../../../_components/assets/Connector.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminRoutes } from "@/lib/adminRoutes";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { ApprovalActionConfirmModal } from "@/app/admin/_components/ApprovalActionConfirmModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { TransactionActionDocumentViewModel } from "./hooks/useTransactionDetails";
import { ArrowUpRight, Check, ChevronDown, Info, X } from "lucide-react";
import React from "react";
import { useState } from "react";

interface WorkflowUser {
  name: string;
  role: string;
  status:
  | "Review Pending"
  | "Approval Pending"
  | "Review Completed"
  | "Rejected";
  initials: string;
  color: string;
  date: string;
  time: string;
  comment: string;
}

const workflowUsers: WorkflowUser[] = [
  {
    name: "Sodiq Olajide",
    role: "Lead of Internal Control",
    status: "Review Completed",
    initials: "BC",
    color: "#F5B89C",
    date: "April 11",
    time: "11:00 am",
    comment:
      "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their action",
  },
  {
    name: "Moshood Aremu",
    role: "Finance Manager",
    status: "Review Completed",
    initials: "MA",
    color: "#F5B89C",
    date: "April 11",
    time: "11:00 am",
    comment:
      "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their action",
  },
  {
    name: "Jide Jadeosola",
    role: "Head of Settlement",
    status: "Rejected",
    initials: "JI",
    color: "#A6F4C5",
    date: "April 11",
    time: "11:00 am",
    comment:
      "This is the comment box, for when the action approval (line) was rejected",
  },
];

interface TakeActionOverlayProps {
  opened: boolean;
  onClose: () => void;
  transactionId?: string;
  documents?: TransactionActionDocumentViewModel[];
}

function DocumentApprovalSuccessIcon() {
  return (
    <div className="relative flex h-[100px] w-[100px] items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#12B76A]" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#12B76A]">
        <Check className="h-8 w-8 text-white" strokeWidth={3} aria-hidden />
      </div>
    </div>
  );
}

export default function TakeActionOverlay({
  opened,
  onClose,
  transactionId,
  documents = [],
}: TakeActionOverlayProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [takeActionPopoverKey, setTakeActionPopoverKey] = useState<string | null>(
    null
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [completeApprovalOpen, setCompleteApprovalOpen] = useState(false);
  const [approvalSuccessOpen, setApprovalSuccessOpen] = useState(false);

  const [resubmissionOpen, setResubmissionOpen] = useState(false);
  const [resubmissionSuccessOpen, setResubmissionSuccessOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectSuccessOpen, setRejectSuccessOpen] = useState(false);

  const [transactionCompleteReviewOpen, setTransactionCompleteReviewOpen] =
    useState(false);
  const [
    transactionCompleteReviewSuccessOpen,
    setTransactionCompleteReviewSuccessOpen,
  ] = useState(false);
  const [requestMoreInfoOpen, setRequestMoreInfoOpen] = useState(false);
  const [requestMoreInfoSuccessOpen, setRequestMoreInfoSuccessOpen] =
    useState(false);

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

  const invalidateTransactionDetail = async () => {
    if (!transactionId) return;
    await queryClient.invalidateQueries({
      queryKey: adminKeys.transactions.detail(transactionId),
    });
  };

  const approveDocumentMutation = useCreateData(
    (variables: { transactionId: string; documentId: string; notes: string }) =>
      adminApi.transactions.approveDocument(
        variables.transactionId,
        variables.documentId,
        { notes: variables.notes }
      ),
    {
      onSuccess: async () => {
        await invalidateTransactionDetail();
        setCompleteApprovalOpen(false);
        setApprovalSuccessOpen(true);
      },
      onError: (error) =>
        handleMutationError(error, "Unable to approve transaction document."),
    }
  );

  const requestInfoMutation = useCreateData(
    (variables: { transactionId: string; documentId: string; comment: string }) =>
      adminApi.transactions.requestDocumentInfo(
        variables.transactionId,
        variables.documentId,
        { comment: variables.comment }
      ),
    {
      onSuccess: async () => {
        await invalidateTransactionDetail();        
        setResubmissionOpen(false);
        setResubmissionSuccessOpen(true);
      },
      onError: (error) =>
        handleMutationError(error, "Unable to request more information."),
    }
  );

  const openCompleteApprovalFlow = () => {
    if (!selectedDocumentId) return;
    setTakeActionPopoverKey(null);
    setCompleteApprovalOpen(true);
  };

  const closeCompleteApproval = () => {
    setCompleteApprovalOpen(false);
  };

  const submitCompleteApproval = (comment: string) => {
    if (!transactionId || !selectedDocumentId) return;
    approveDocumentMutation.mutate({
      transactionId,
      documentId: selectedDocumentId,
      notes: comment,
    });
  };

  const openResubmissionFlow = () => {
    if (!selectedDocumentId) return;
    setTakeActionPopoverKey(null);
    setResubmissionOpen(true);
  };

  const closeResubmission = () => {
    setResubmissionOpen(false);
  };

  const submitResubmission = (comment: string) => {
    if (!transactionId || !selectedDocumentId) return;
    requestInfoMutation.mutate({
      transactionId,
      documentId: selectedDocumentId,
      comment,
    });
  };

  const openRejectFlow = () => {
    setTakeActionPopoverKey(null);
    setRejectOpen(true);
  };

  const closeReject = () => {
    setRejectOpen(false);
  };

  const submitReject = (comment: string) => {
    void comment;
    setRejectOpen(false);
    setRejectSuccessOpen(true);
  };

  const openTransactionCompleteReview = () => {
    setTransactionCompleteReviewOpen(true);
  };

  const closeTransactionCompleteReview = () => {
    setTransactionCompleteReviewOpen(false);
  };

  const submitTransactionCompleteReview = (comment: string) => {
    void comment;
    setTransactionCompleteReviewOpen(false);
    setTransactionCompleteReviewSuccessOpen(true);
  };

  const openRequestMoreInfo = () => {
    setRequestMoreInfoOpen(true);
  };

  const closeRequestMoreInfo = () => {
    setRequestMoreInfoOpen(false);
  };

  const submitRequestMoreInfo = (comment: string) => {
    void comment;
    setRequestMoreInfoOpen(false);
    setRequestMoreInfoSuccessOpen(true);
  };

  const navigateToTransactionsList = () => {
    router.push(adminRoutes.adminTransactions());
    setApprovalSuccessOpen(false);
    setResubmissionSuccessOpen(false);
    setRejectSuccessOpen(false);
    setTransactionCompleteReviewSuccessOpen(false);
    setRequestMoreInfoSuccessOpen(false);
  };

  return (
    <>
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={480}
      zIndex={3000}
      withCloseButton={false}
      overlayProps={{ opacity: 0.55, blur: 2 }}
      classNames={{
        body: "h-full",
      }}
    // styles={{
    //   body: {
    //     display: "flex",
    //     flexDirection: "column",
    //     height: "100%",
    //     paddingBottom: 0,
    //   },
    // }}
    >

      <div className="flex flex-col h-full">
        <div>

          {/* Header */}
          <div className="space-y-1 mb-3">
            <Title order={4} className="text-body-heading-300 font-bold! text-xl!">
              <span className="text-body-text-50!">Request: </span>
              Transaction Review and Approval
            </Title>
            <Text size="sm" className="text-body-text-50!">
              Take action on transactions
            </Text>
          </div>

          {/* Tabs */}
          <Tabs
            color="orange"
            defaultValue="overview"
            className="flex flex-col flex-1 min-h-0 rounded-lg overflow-hidden"
          >
            <Tabs.List className="border-b border-[#EAECF0] px-1 pt-1">
              <AdminTabButton value="overview">
                Workflow Line
              </AdminTabButton>
              <AdminTabButton value="receipt">
                Documentation
              </AdminTabButton>
            </Tabs.List>

            <Tabs.Panel value="overview" className="flex-1 overflow-y-auto pb-4 pt-4">
              <div className="space-y-5">
                {workflowUsers.map((user, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-[#F7F7F7] rounded-lg p-5 mb-0 space-y-4!">
                      {/* Header Row */}
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Group align="flex-start" gap="sm" wrap="nowrap">
                          <Avatar radius="xl" size="md" color={user.color}>
                            {user.initials}
                          </Avatar>

                          <div className="min-w-0 space-y-1">
                            <Text fw={500} className="text-body-heading-300">
                              {user.name}
                            </Text>
                            <Text size="xs" c="dimmed" className="text-body-text-50!">
                              {user.role}
                            </Text>

                            {/* Date & Time */}
                            <Group gap={6} mt={4}>
                              <Text size="xs" c="dimmed" className="text-body-text-200 border-r border-[#E1E0E0] pr-3">
                                📅 {user.date}
                              </Text>
                              <Text size="xs" c="dimmed" className="text-body-text-200">
                                ⏰ {user.time}
                              </Text>
                            </Group>
                          </div>
                        </Group>

                        {/* Status */}
                        <div className="text-right shrink-0">
                          <StatusBadge status={user.status} size="xs" />
                          <Text size="xs" c="dimmed" className="text-body-text-50! block mt-1">
                            Action Taken
                          </Text>
                        </div>
                      </Group>

                      {/* Comment Box */}
                      <div className="bg-white border border-[#E1E0E0] rounded-lg p-4">
                        <Text size="xs" className="text-body-text-200 leading-relaxed">
                          {user.comment}
                        </Text>
                      </div>
                    </div>

                    {/* Connector */}
                    {index < workflowUsers.length - 1 && (
                      <Image src={Connector} alt="connector" className="ml-8 -my-0.5" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="receipt" className="flex-1 overflow-y-auto pb-32 pt-4">
              {documents.length === 0 ? (
                <div className="rounded-lg border border-[#EAECF0] bg-white p-6 text-center">
                  <Text fw={600} className="text-body-heading-300">
                    No documents available
                  </Text>
                  <Text size="sm" className="text-body-text-200 mt-1">
                    There are no uploaded documents for this transaction yet.
                  </Text>
                </div>
              ) : (
                <div className="rounded-lg border border-[#E1E0E0] overflow-hidden divide-y divide-[#E1E0E0]">
                  {documents.map((doc) => {
                    const docKey = doc.id;
                    return (
                      <Group
                        key={doc.id}
                        justify="space-between"
                        className="px-4 py-3 bg-white"
                        wrap="nowrap"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <Text size="sm" fw={500} className="text-body-heading-300">
                            {doc.title}
                          </Text>
                          <Text size="xs" c="dimmed" className="text-body-text-50!">
                            {doc.fileSize}
                          </Text>

                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer flex items-center gap-1 underline text-body-text-200 hover:text-primary-400 mt-2 text-xs"
                          >
                            View Document
                            <ArrowUpRight size={14} className="text-primary-400" />
                          </a>
                        </div>

                        <div className="text-right flex flex-col items-end gap-3 shrink-0">
                          <StatusBadge
                            variant="light"
                            radius="xl"
                            bg="#F2F4F7"
                            color="#344054"
                            status={doc.verificationStatus}
                          />

                          <Popover
                            width={360}
                            position="bottom-end"
                            shadow="md"
                            withinPortal
                            zIndex={3200}
                            opened={takeActionPopoverKey === docKey}
                            onClose={() => setTakeActionPopoverKey(null)}
                          >
                            <Popover.Target>
                              <Text
                                component="span"
                                size="xs"
                                className="cursor-pointer underline flex items-center gap-1 text-body-text-200 hover:text-primary-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocumentId(doc.id);
                                  setTakeActionPopoverKey((k) =>
                                    k === docKey ? null : docKey
                                  );
                                }}
                              >
                                Take Action{" "}
                                <ChevronDown size={14} className="text-primary-400" />
                              </Text>
                            </Popover.Target>
                            <Popover.Dropdown
                              p={0}
                              className="rounded-xl border border-[#E1E0E0] shadow-lg overflow-hidden"
                            >
                              <div className="p-4 border-b border-[#EAECF0]">
                                <Text fw={700} className="text-body-heading-300 text-sm">
                                  Take Action
                                </Text>
                                <Text size="xs" className="text-body-text-200 mt-0.5">
                                  Take action with ease
                                </Text>
                              </div>
                              <div className="divide-y divide-[#EAECF0]">
                                <button
                                  type="button"
                                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[#F9FAFB]"
                                  onClick={openCompleteApprovalFlow}
                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DD4F05]">
                                    <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                                  </span>
                                  <span className="min-w-0">
                                    <Text fw={600} size="sm" className="text-body-heading-300">
                                      Complete Approval
                                    </Text>
                                    <Text size="xs" className="text-body-text-200 mt-1 leading-relaxed">
                                      Accept the document as valid and move the application
                                      forward in the workflow.
                                    </Text>
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[#F9FAFB]"
                                  onClick={openResubmissionFlow}
                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DD4F05]">
                                    <Info className="h-5 w-5 text-white" strokeWidth={2.5} />
                                  </span>
                                  <span className="min-w-0">
                                    <Text fw={600} size="sm" className="text-body-heading-300">
                                      Request Resubmission
                                    </Text>
                                    <Text size="xs" className="text-body-text-200 mt-1 leading-relaxed">
                                      Send the application back to the customer for correction
                                      or replacement of the document.
                                    </Text>
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[#F9FAFB]"
                                  onClick={openRejectFlow}
                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F04438]">
                                    <X className="h-5 w-5 text-white" strokeWidth={2.5} />
                                  </span>
                                  <span className="min-w-0">
                                    <Text fw={600} size="sm" className="text-body-heading-300">
                                      Reject Document
                                    </Text>
                                    <Text size="xs" className="text-body-text-200 mt-1 leading-relaxed">
                                      Decline the document if it fails compliance/requirements.
                                    </Text>
                                  </span>
                                </button>
                              </div>
                            </Popover.Dropdown>
                          </Popover>
                        </div>
                      </Group>
                    );
                  })}
                </div>
              )}
            </Tabs.Panel>
          </Tabs>

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 z-10 py-5 px-4 -mx-4 -mb-4 mt-auto border-t border-[#E1E0E0] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <Group justify="center" gap="md">
            <Button
              color="#DD4F05"
              radius="xl"
              size="lg"
              className="font-medium! text-sm!"
              onClick={openTransactionCompleteReview}
            >
              Complete Review
            </Button>
            <Button
              variant="outline"
              radius="xl"
              size="lg"
              color="dark"
              className="font-medium! text-sm!"
              onClick={openRequestMoreInfo}
            >
              Request More Info
            </Button>
          </Group>
        </div>
      </div>
    </Drawer>

    <ApprovalActionConfirmModal
      opened={completeApprovalOpen}
      onClose={closeCompleteApproval}
      title="Complete Document Approval ?"
      message="You are about to approve this document. Once confirmed, your approval will be recorded and the document will be marked as completed in the workflow."
      primaryButtonText="Yes, Complete Document Approval"
      secondaryButtonText="No, Close"
      onConfirm={submitCompleteApproval}
      isLoading={approveDocumentMutation.isPending}
    />

    <ApprovalActionConfirmModal
      opened={resubmissionOpen}
      onClose={closeResubmission}
      title="Request for Document resubmission ?"
      message="You are about to request a resubmission of this document. Once confirmed, the document will be returned to the submitter along with your comments for correction and resubmission"
      primaryButtonText="Yes, Request For Document Resubmission"
      secondaryButtonText="No, Close"
      onConfirm={submitResubmission}
      isLoading={requestInfoMutation.isPending}
    />

    <ApprovalActionConfirmModal
      opened={rejectOpen}
      onClose={closeReject}
      title="Reject Document?"
      message="You are about to reject this document. Once confirmed, your rejection and comments will be recorded, and the document will be marked as rejected in the workflow"
      primaryButtonText="Yes, Reject Document"
      secondaryButtonText="No, Close"
      onConfirm={submitReject}
    />

    <ApprovalActionConfirmModal
      opened={transactionCompleteReviewOpen}
      onClose={closeTransactionCompleteReview}
      title="Complete Approval ?"
      message="You are about to mark this application as fully approved. Once confirmed, the process will be completed, and no further reviews or changes can be made"
      primaryButtonText="Yes, Complete Approval"
      secondaryButtonText="No, Close"
      onConfirm={submitTransactionCompleteReview}
    />

    <ApprovalActionConfirmModal
      opened={requestMoreInfoOpen}
      onClose={closeRequestMoreInfo}
      title="Request More Information?"
      message={
        <>
          <p>
            Are you sure you want to request more information? Please add your
            comments based on this application/request.
          </p>
          <p>
            <span className="font-semibold text-primary-400">Note: </span>
            your comments will not be sent to the customer but to the approving
            officer, who will use them to make the final decision.
          </p>
        </>
      }
      primaryButtonText="Yes, Complete Review"
      secondaryButtonText="No, Close"
      onConfirm={submitRequestMoreInfo}
    />

    <SuccessModal
      opened={approvalSuccessOpen}
      onClose={() => setApprovalSuccessOpen(false)}
      title="Document Approval Completed"
      message="This document has been successfully approved and marked as completed in the workflow"
      primaryButtonText="View More Action Approval"
      onPrimaryClick={navigateToTransactionsList}
      secondaryButtonText="Close"
      onSecondaryClick={() => setApprovalSuccessOpen(false)}
      icon={<DocumentApprovalSuccessIcon />}
      zIndex={4100}
    />

    <SuccessModal
      opened={resubmissionSuccessOpen}
      onClose={() => setResubmissionSuccessOpen(false)}
      title="Document Resubmission Request Completed"
      message="Your request for resubmission has been sent. The document has been returned to the submitter with your comments for review and correction."
      primaryButtonText="View More Action Approval"
      onPrimaryClick={navigateToTransactionsList}
      secondaryButtonText="Close"
      onSecondaryClick={() => setResubmissionSuccessOpen(false)}
      icon={<DocumentApprovalSuccessIcon />}
      zIndex={4100}
    />

    <SuccessModal
      opened={rejectSuccessOpen}
      onClose={() => setRejectSuccessOpen(false)}
      title="Document Rejected"
      message="The document has been rejected and your comments have been recorded in the workflow"
      primaryButtonText="View More Action Approval"
      onPrimaryClick={navigateToTransactionsList}
      secondaryButtonText="Close"
      onSecondaryClick={() => setRejectSuccessOpen(false)}
      icon={<DocumentApprovalSuccessIcon />}
      zIndex={4100}
    />

    <SuccessModal
      opened={transactionCompleteReviewSuccessOpen}
      onClose={() => setTransactionCompleteReviewSuccessOpen(false)}
      title="Action Approval Completed"
      message="The request/application has been successfully approved and the process is now complete"
      primaryButtonText="View More Action Approval"
      onPrimaryClick={navigateToTransactionsList}
      secondaryButtonText="Close"
      onSecondaryClick={() =>
        setTransactionCompleteReviewSuccessOpen(false)
      }
      icon={<DocumentApprovalSuccessIcon />}
      zIndex={4100}
    />

    <SuccessModal
      opened={requestMoreInfoSuccessOpen}
      onClose={() => setRequestMoreInfoSuccessOpen(false)}
      title="More Information Requested"
      message="Your request for more information has been submitted successfully and passed on to the next review/approval officer"
      primaryButtonText="View More Action Approval"
      onPrimaryClick={navigateToTransactionsList}
      secondaryButtonText="Close"
      onSecondaryClick={() => setRequestMoreInfoSuccessOpen(false)}
      icon={<DocumentApprovalSuccessIcon />}
      zIndex={4100}
    />
    </>
  );
}
