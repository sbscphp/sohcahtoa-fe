"use client";

import React from "react";
import { Drawer, Group, Text, Title, Button, Avatar, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ApprovalActionConfirmModal } from "@/app/admin/_components/ApprovalActionConfirmModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { RateWorkflowLineItem } from "@/app/admin/_services/admin-api";
import Connector from "../../../../_components/assets/Connector.png";
import { useState } from "react";
import { toSentenceCase } from "@/app/utils/helper/toSentence";

interface RateTakeActionOverlayProps {
  opened: boolean;
  onClose: () => void;
  rateId?: string;
  rateStatus?: string;
  isApprovalOfficer?: boolean;
  approvalState?: string;
  workflowLine?: RateWorkflowLineItem[];
}

function formatWorkflowDate(ts: string): { date: string; time: string } {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return { date: "--", time: "--" };
  return {
    date: d.toLocaleDateString("en-CA"),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

export default function RateTakeActionOverlay({
  opened,
  onClose,
  rateId,
  rateStatus,
  isApprovalOfficer = false,
  approvalState,
  workflowLine = [],
}: RateTakeActionOverlayProps) {
  const queryClient = useQueryClient();
  const isPendingApproval = rateStatus === "PENDING_APPROVAL";

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveSuccessOpen, setApproveSuccessOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectSuccessOpen, setRejectSuccessOpen] = useState(false);

  const handleMutationError = (error: Error, defaultMessage: string) => {
    const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
    notifications.show({
      color: "red",
      title: "Action failed",
      message: apiResponse?.error?.message ?? error.message ?? defaultMessage,
    });
  };

  const invalidateRate = async () => {
    if (!rateId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.rate.detail(rateId) }),
      queryClient.invalidateQueries({ queryKey: adminKeys.rate.all }),
    ]);
  };

  const approveMutation = useCreateData(
    (variables: { rateId: string; notes: string }) =>
      adminApi.rate.approve(variables.rateId, { notes: variables.notes }),
    {
      onSuccess: async () => {
        await invalidateRate();
        setApproveOpen(false);
        setApproveSuccessOpen(true);
      },
      onError: (error) => handleMutationError(error, "Unable to approve this rate."),
    }
  );

  const rejectMutation = useCreateData(
    (variables: { rateId: string; reason: string }) =>
      adminApi.rate.reject(variables.rateId, { reason: variables.reason }),
    {
      onSuccess: async () => {
        await invalidateRate();
        setRejectOpen(false);
        setRejectSuccessOpen(true);
      },
      onError: (error) => handleMutationError(error, "Unable to reject this rate."),
    }
  );

  const submitApprove = (notes: string) => {
    if (!rateId) return;
    approveMutation.mutate({ rateId, notes });
  };

  const submitReject = (reason: string) => {
    if (!rateId) return;
    rejectMutation.mutate({ rateId, reason });
  };

  const handleSuccessClose = () => {
    setApproveSuccessOpen(false);
    setRejectSuccessOpen(false);
    onClose();
  };

  const showFooter = isApprovalOfficer && isPendingApproval;

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
        classNames={{ body: "h-full" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="space-y-1 mb-3">
            <Title order={4} className="text-body-heading-300 font-bold! text-xl!">
              <span className="text-body-text-50!">Request: </span>
              Rate Review and Approval
            </Title>
            <Text size="sm" className="text-body-text-50!">
              Take action on this rate
            </Text>
          </div>

          {/* Workflow Line content */}
          <div className="flex-1 overflow-y-auto pb-4 pt-4">
            <Flex className="mb-4" align="center" gap="sm">
              <StatusBadge status={toSentenceCase(rateStatus ?? "--")} size="lg" />
              <Text size="sm" className="text-body-text-200">{approvalState}</Text>
            </Flex>

            {workflowLine.length === 0 ? (
              <div className="rounded-lg border border-[#EAECF0] bg-white p-6 text-center">
                <Text fw={600} className="text-body-heading-300">
                  No workflow history available
                </Text>
                <Text size="sm" className="text-body-text-200 mt-1">
                  No workflow actions have been recorded for this rate yet.
                </Text>
              </div>
            ) : (
              <div className="space-y-5">
                {workflowLine.map((item, index) => {
                  const { date, time } = formatWorkflowDate(item.timestamp);
                  const actorLabel = item.adminName ?? "--";
                  const actionLabel = item.title ?? "--";
                  const statusLabel = item.outcome ?? "--";
                  const comment = item.comment ?? "--";

                  return (
                    <React.Fragment key={item.id}>
                      <div className="bg-[#F7F7F7] rounded-lg p-5 mb-0 space-y-4!">
                        {/* Header Row */}
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Group align="flex-start" gap="sm" wrap="nowrap">
                            <Avatar radius="xl" size="md" color="#F5B89C">
                              {actorLabel.slice(0, 2).toUpperCase()}
                            </Avatar>

                            <div className="min-w-0 space-y-1">
                              <Text fw={500} className="text-body-heading-300 break-all">
                                {actorLabel}
                              </Text>
                              <Text size="xs" c="dimmed" className="text-body-text-50!">
                                {actionLabel}
                              </Text>

                              {/* Date & Time */}
                              <Group gap={6} mt={4}>
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  className="text-body-text-200 border-r border-[#E1E0E0] pr-3"
                                >
                                  📅 {date}
                                </Text>
                                <Text size="xs" c="dimmed" className="text-body-text-200">
                                  ⏰ {time}
                                </Text>
                              </Group>
                            </div>
                          </Group>

                          {/* Status */}
                          <div className="text-right shrink-0">
                            <StatusBadge status={statusLabel} size="xs" />
                            <Text
                              size="xs"
                              c="dimmed"
                              className="text-body-text-50! block mt-1"
                            >
                              Action Taken
                            </Text>
                          </div>
                        </Group>

                        {/* Comment Box */}
                        <div className="bg-white border border-[#E1E0E0] rounded-lg p-4">
                          <Text size="xs" className="text-body-text-200 leading-relaxed">
                            {comment}
                          </Text>
                        </div>
                      </div>

                      {/* Connector */}
                      {index < workflowLine.length - 1 && (
                        <Image src={Connector} alt="connector" className="ml-8 -my-0.5" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          {showFooter && (
            <div className="sticky bottom-0 left-0 right-0 z-10 py-5 px-4 -mx-4 -mb-4 mt-auto border-t border-[#E1E0E0] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
              <Group justify="center" gap="md">
                <Button
                  color="#DD4F05"
                  radius="xl"
                  size="lg"
                  className="font-medium! text-sm!"
                  onClick={() => setApproveOpen(true)}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  radius="xl"
                  size="lg"
                  color="red"
                  className="font-medium! text-sm!"
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              </Group>
            </div>
          )}
        </div>
      </Drawer>

      <ApprovalActionConfirmModal
        opened={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve Rate?"
        message="You are about to approve this rate. Once confirmed, the rate will be marked as approved and will proceed through the workflow."
        primaryButtonText="Yes, Approve Rate"
        secondaryButtonText="No, Close"
        onConfirm={submitApprove}
        isLoading={approveMutation.isPending}
        commentRequired={false}
      />

      <ApprovalActionConfirmModal
        opened={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Rate?"
        message="You are about to reject this rate. Once confirmed, the rate will be declined and no further processing will take place."
        primaryButtonText="Yes, Reject Rate"
        secondaryButtonText="No, Close"
        onConfirm={submitReject}
        isLoading={rejectMutation.isPending}
      />

      <SuccessModal
        opened={approveSuccessOpen}
        onClose={handleSuccessClose}
        title="Rate Approved"
        message="The rate has been successfully approved and updated in the workflow."
        primaryButtonText="Close"
        onPrimaryClick={handleSuccessClose}
        secondaryButtonText="Close"
        onSecondaryClick={handleSuccessClose}
        zIndex={4100}
      />

      <SuccessModal
        opened={rejectSuccessOpen}
        onClose={handleSuccessClose}
        title="Rate Rejected"
        message="The rate has been successfully rejected and marked as closed."
        primaryButtonText="Close"
        onPrimaryClick={handleSuccessClose}
        secondaryButtonText="Close"
        onSecondaryClick={handleSuccessClose}
        zIndex={4100}
      />
    </>
  );
}
