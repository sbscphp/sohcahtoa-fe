"use client";

import { Fragment, useState } from "react";
import { Avatar, Button, Drawer, Group, Modal, Tabs, Text, Textarea, Title } from "@mantine/core";
import Image from "next/image";
import Connector from "../../../_components/assets/Connector.png";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import type { DisbursementStatus } from "../_data/fxInventoryMock";

type StageKind = "review" | "approval";
type StageState = "pending" | "completed" | "rejected";

interface WorkflowStage {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarClass: string;
  kind: StageKind;
  state: StageState;
  comment?: string;
  actedAt?: string;
}

const STAGE_TEMPLATES: Array<Omit<WorkflowStage, "state" | "comment" | "actedAt">> = [
  {
    id: "sodiq",
    name: "Sodiq Olajide",
    role: "Lead of Internal Control",
    initials: "SO",
    avatarClass: "bg-primary-25 text-primary-500",
    kind: "review",
  },
  {
    id: "moshood",
    name: "Moshood Aremu",
    role: "Finance Manager",
    initials: "MA",
    avatarClass: "bg-orange-100 text-orange-700",
    kind: "review",
  },
  {
    id: "jide",
    name: "Jide Jadeosola",
    role: "Head of Settlement",
    initials: "JJ",
    avatarClass: "bg-green-100 text-green-700",
    kind: "approval",
  },
];

const COMPLETED_COMMENT =
  "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their action";
const COMPLETED_ACTED_AT = "April 11, 11:00 am";

const STATUS_COLOR: Record<StageState, string> = {
  pending: "#B54708",
  completed: "#027A48",
  rejected: "#B42318",
};

function stageLabel(stage: WorkflowStage) {
  if (stage.state === "rejected") return "Rejected";
  if (stage.state === "completed") {
    return stage.kind === "approval" ? "Approval Completed" : "Review Completed";
  }
  return stage.kind === "approval" ? "Approval Pending" : "Review Pending";
}

function stageSubtitle(stage: WorkflowStage) {
  if (stage.state === "pending") return "Awaiting Action";
  if (stage.state === "completed") return "Action Taken";
  return "Rejected";
}

function stageKindLabel(kind: StageKind) {
  return kind === "approval" ? "Approval" : "Review";
}

function splitActedAt(actedAt: string) {
  const separator = actedAt.indexOf(", ");
  if (separator < 0) return { date: actedAt, time: "--" };
  return {
    date: actedAt.slice(0, separator),
    time: actedAt.slice(separator + 2),
  };
}

function buildStages(status: DisbursementStatus): WorkflowStage[] {
  if (status === "Approved") {
    return STAGE_TEMPLATES.map((stage) => ({
      ...stage,
      state: "completed",
      comment: COMPLETED_COMMENT,
      actedAt: COMPLETED_ACTED_AT,
    }));
  }

  if (status === "Rejected") {
    return STAGE_TEMPLATES.map((stage, index) =>
      index === STAGE_TEMPLATES.length - 1
        ? { ...stage, state: "rejected" }
        : {
            ...stage,
            state: "completed",
            comment: COMPLETED_COMMENT,
            actedAt: COMPLETED_ACTED_AT,
          }
    );
  }

  return STAGE_TEMPLATES.map((stage) => ({ ...stage, state: "pending" }));
}

function formatActedAt(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface DisbursementTakeActionDrawerProps {
  opened: boolean;
  onClose: () => void;
  status: DisbursementStatus;
}

export default function DisbursementTakeActionDrawer({
  opened,
  onClose,
  status,
}: DisbursementTakeActionDrawerProps) {
  const [stages, setStages] = useState(() => buildStages(status));
  const [commentOpen, setCommentOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [pendingCompletion, setPendingCompletion] = useState<{
    comment: string;
    actedAt: string;
  } | null>(null);

  const nextPendingIndex = stages.findIndex((stage) => stage.state === "pending");
  const hasPendingStage = nextPendingIndex >= 0;

  const closeComment = () => {
    setCommentOpen(false);
    setComment("");
    setCommentError("");
  };

  const submitComment = () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      setCommentError("Comment is required");
      return;
    }

    setPendingCompletion({ comment: trimmed, actedAt: formatActedAt(new Date()) });
    closeComment();
    setSuccessOpen(true);
  };

  const applyCompletion = () => {
    if (!pendingCompletion) {
      setSuccessOpen(false);
      return;
    }

    setStages((current) => {
      const nextIndex = current.findIndex((stage) => stage.state === "pending");
      if (nextIndex < 0) return current;
      return current.map((stage, index) =>
        index === nextIndex
          ? {
              ...stage,
              state: "completed",
              comment: pendingCompletion.comment,
              actedAt: pendingCompletion.actedAt,
            }
          : stage
      );
    });

    setPendingCompletion(null);
    setSuccessOpen(false);
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        position="right"
        size={480}
        zIndex={300}
        withCloseButton={false}
        overlayProps={{ opacity: 0.45, blur: 2 }}
        classNames={{ body: "h-full p-0" }}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 mb-3">
              <Title order={4} className="text-body-heading-300 font-bold! text-xl!">
                <span className="text-body-text-50!">Request: </span>
                Disbursement Review and Approval
              </Title>
              <Text size="sm" className="text-body-text-50!">
                Take action on disbursement
              </Text>
            </div>


            <Tabs
              color="orange"
              
              value="workflow"
              className="flex flex-col flex-1 min-h-0 rounded-lg overflow-hidden"
            >
              <Tabs.List className="border-b border-[#EAECF0] px-1 pt-1 mb-4">
                <AdminTabButton value="workflow">Workflow Line</AdminTabButton>
              </Tabs.List>

              <Tabs.Panel value="workflow">
                <div className="space-y-5">
                  {stages.map((stage, index) => {
                    const isPending = stage.state === "pending";
                    const containerClass = isPending
                      ? index === nextPendingIndex
                        ? "bg-gray-25 border border-primary-100"
                        : "bg-[#F7F7F7]"
                      : "bg-[#F7F7F7]";
                    const { date, time } =
                      stage.state === "completed" && stage.actedAt
                        ? splitActedAt(stage.actedAt)
                        : { date: "--", time: "--" };

                    return (
                      <Fragment key={stage.id}>
                        <div className={`${containerClass} rounded-lg p-5 mb-0 space-y-4!`}>
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Group align="flex-start" gap="sm" wrap="nowrap">
                              <Avatar
                                radius="xl"
                                size="md"
                                color={isPending ? "#B0B0B0" : "#F5B89C"}
                              >
                                {stage.initials}
                              </Avatar>

                              <div className="min-w-0 space-y-1">
                                <Text fw={500} className="text-body-heading-300 break-all">
                                  {stage.name}
                                </Text>
                                <Text size="xs" c="dimmed" className="text-body-text-50!">
                                  {stage.role} •{" "}
                                  <span className="font-medium text-body-heading-300">
                                    {stageKindLabel(stage.kind)}
                                  </span>
                                </Text>

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

                            <div className="text-right shrink-0">
                              <StatusBadge
                                status={stageLabel(stage)}
                                color={STATUS_COLOR[stage.state]}
                                size="xs"
                              />
                              <Text size="xs" c="dimmed" className="text-body-text-50! block mt-1">
                                {stageSubtitle(stage)}
                              </Text>
                            </div>
                          </Group>

                          {stage.state === "completed" && stage.comment ? (
                            <div className="bg-white border border-[#E1E0E0] rounded-lg p-4">
                              <Text size="xs" className="text-body-text-200 leading-relaxed">
                                {stage.comment}
                              </Text>
                            </div>
                          ) : null}
                        </div>

                        {index < stages.length - 1 ? (
                          <Image src={Connector} alt="connector" className="ml-8 -my-0.5" />
                        ) : null}
                      </Fragment>
                    );
                  })}
                </div>
              </Tabs.Panel>
            </Tabs>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            {hasPendingStage ? (
              <CustomButton buttonType="primary" onClick={() => setCommentOpen(true)}>
                Complete Review
              </CustomButton>
            ) : null}
            <Button variant="default" radius="xl" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Drawer>

      <Modal
        opened={commentOpen}
        onClose={closeComment}
        centered
        withCloseButton={false}
        radius="lg"
        padding="xl"
        zIndex={4000}
        overlayProps={{ opacity: 0.3, blur: 2 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-00 text-2xl text-primary-400">
            !
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Complete Review ?</h2>
          <p className="mt-2 text-sm text-gray-500">
            You are about to mark this request as reviewed. Once confirmed, your review will be
            submitted and passed on to the next stage for approval
          </p>
        </div>

        <Textarea
          className="mt-5"
          label="Comment"
          withAsterisk
          placeholder="Start Typing"
          minRows={3}
          value={comment}
          error={commentError}
          onChange={(event) => {
            setComment(event.currentTarget.value);
            if (commentError) setCommentError("");
          }}
        />

        <div className="mt-5 space-y-3">
          <Button fullWidth radius="xl" color="orange" onClick={submitComment}>
            Yes, Complete Review
          </Button>
          <Button fullWidth radius="xl" variant="outline" color="gray" onClick={closeComment}>
            No, Close
          </Button>
        </div>
      </Modal>

      <SuccessModal
        opened={successOpen}
        onClose={applyCompletion}
        zIndex={4000}
        title="Review Completed"
        message="The review has been successfully completed and forwarded to the next stage for review or approval"
        primaryButtonText="Close"
        onPrimaryClick={applyCompletion}
      />
    </>
  );
}
