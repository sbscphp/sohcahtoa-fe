"use client";

import { Fragment, useState } from "react";
import { Avatar, Button, Drawer, Group, Tabs, Text, Title } from "@mantine/core";
import Image from "next/image";
import Connector from "../../../_components/assets/Connector.png";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { ApprovalActionConfirmModal } from "@/app/admin/_components/ApprovalActionConfirmModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import type {
  DisbursementActivityCard,
  DisbursementStageCard,
  DisbursementStageState,
} from "../hooks/useFxInventoryDisbursement";

const STAGE_BADGE_LABEL: Record<DisbursementStageState, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STAGE_BADGE_COLOR: Record<DisbursementStageState, string> = {
  pending: "#B54708",
  approved: "#027A48",
  rejected: "#B42318",
};

const STAGE_SUBTITLE: Record<DisbursementStageState, string> = {
  pending: "Awaiting Action",
  approved: "Action Taken",
  rejected: "Action Taken",
};

/** Avatar initials from a full name (e.g. "Anu Wapo" -> "AW"). */
function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DateTimeRow({ date, time }: { date: string; time: string }) {
  return (
    <Group gap={6} mt={4}>
      <Text size="xs" c="dimmed" className="text-body-text-200 border-r border-[#E1E0E0] pr-3">
        📅 {date}
      </Text>
      <Text size="xs" c="dimmed" className="text-body-text-200">
        ⏰ {time}
      </Text>
    </Group>
  );
}

function CommentBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E1E0E0] rounded-lg p-4">
      <Text size="xs" className="text-body-text-200 leading-relaxed">
        {children}
      </Text>
    </div>
  );
}

function StageCard({ stage }: { stage: DisbursementStageCard }) {
  const isPending = stage.state === "pending";
  const containerClass =
    isPending && stage.isCurrent
      ? "bg-gray-25 border border-primary-100"
      : isPending && stage.isStale
        ? "bg-gray-25 opacity-60"
        : "bg-[#F7F7F7]";

  return (
    <div className={`${containerClass} rounded-lg p-5 mb-0 space-y-4!`}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group align="flex-start" gap="sm" wrap="nowrap">
          <Avatar radius="xl" size="md" color={isPending ? "#B0B0B0" : "#F5B89C"}>
            {getInitials(stage.actorName)}
          </Avatar>

          <div className="min-w-0 space-y-1">
            <Text fw={500} className="text-body-heading-300 break-all">
              {stage.actorName}
            </Text>
            <Text size="xs" c="dimmed" className="text-body-text-50!">
              {stage.actorRole ? `${stage.actorRole} • ` : ""}
              <span className="font-medium text-body-heading-300">{stage.stageName}</span>
            </Text>
            <DateTimeRow date={stage.date} time={stage.time} />
          </div>
        </Group>

        <div className="text-right shrink-0">
          <StatusBadge
            status={STAGE_BADGE_LABEL[stage.state]}
            color={STAGE_BADGE_COLOR[stage.state]}
            size="xs"
          />
          <Text size="xs" c="dimmed" className="text-body-text-50! block mt-1">
            {STAGE_SUBTITLE[stage.state]}
          </Text>
        </div>
      </Group>

      {!isPending ? <CommentBox>{stage.comment || "No comment provided"}</CommentBox> : null}
    </div>
  );
}

function ActivityCard({ activity }: { activity: DisbursementActivityCard }) {
  return (
    <div className="bg-[#F7F7F7] rounded-lg p-5 mb-0 space-y-4!">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group align="flex-start" gap="sm" wrap="nowrap">
          <Avatar radius="xl" size="md" color="#F5B89C">
            {getInitials(activity.actorName)}
          </Avatar>

          <div className="min-w-0 space-y-1">
            <Text fw={500} className="text-body-heading-300 break-all">
              {activity.actorName}
            </Text>
            <Text size="xs" c="dimmed" className="text-body-text-50!">
              {activity.actorRole ? `${activity.actorRole} • ` : ""}
              <span className="font-medium text-body-heading-300">{activity.title}</span>
            </Text>
            <DateTimeRow date={activity.date} time={activity.time} />
          </div>
        </Group>

        <div className="text-right shrink-0">
          <StatusBadge status={activity.outcomeLabel} size="xs" />
          <Text size="xs" c="dimmed" className="text-body-text-50! block mt-1">
            Action Taken
          </Text>
        </div>
      </Group>

      {activity.comment ? <CommentBox>{activity.comment}</CommentBox> : null}
    </div>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-[#EAECF0] bg-white p-6 text-center">
      <Text fw={600} className="text-body-heading-300">
        {title}
      </Text>
      <Text size="sm" className="text-body-text-200 mt-1">
        {message}
      </Text>
    </div>
  );
}

interface DisbursementTakeActionDrawerProps {
  opened: boolean;
  onClose: () => void;
  processName?: string;
  statusLabel: string;
  approvalState?: string;
  stages: DisbursementStageCard[];
  activities: DisbursementActivityCard[];
  canAct: boolean;
  onApprove: (reason: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

type ActionFlow = "approve" | "reject";

export default function DisbursementTakeActionDrawer({
  opened,
  onClose,
  processName,
  statusLabel,
  approvalState,
  stages,
  activities,
  canAct,
  onApprove,
  onReject,
}: DisbursementTakeActionDrawerProps) {
  const [flow, setFlow] = useState<ActionFlow | null>(null);
  const [successFlow, setSuccessFlow] = useState<ActionFlow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const runAction = async (
    action: () => Promise<void>,
    success: ActionFlow
  ) => {
    setSubmitting(true);
    try {
      await action();
      setFlow(null);
      setSuccessFlow(success);
    } catch {
      // The page shows the error notification and the confirmation stays open.
    } finally {
      setSubmitting(false);
    }
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
                {processName || "Disbursement Review and Approval"}
              </Title>
              <Text size="sm" className="text-body-text-50!">
                Take action on disbursement
              </Text>
            </div>

            <Tabs
              color="orange"
              defaultValue="workflow"
              className="flex flex-col flex-1 min-h-0 rounded-lg overflow-hidden"
            >
              <Tabs.List className="border-b border-[#EAECF0] px-1 pt-1 mb-4">
                <AdminTabButton value="workflow">Workflow Line</AdminTabButton>
                <AdminTabButton value="activities">Activities</AdminTabButton>
              </Tabs.List>

              <Tabs.Panel value="workflow">
                <div className="mb-4 flex items-center gap-3">
                  <StatusBadge status={statusLabel} size="md" />
                  {approvalState ? (
                    <Text size="sm" className="text-body-text-200">
                      {approvalState}
                    </Text>
                  ) : null}
                </div>

                {stages.length === 0 ? (
                  <EmptyPanel
                    title="No workflow stages available"
                    message="No approval workflow has been set up for this disbursement."
                  />
                ) : (
                  <div className="space-y-5">
                    {stages.map((stage, index) => (
                      <Fragment key={stage.id}>
                        <StageCard stage={stage} />
                        {index < stages.length - 1 ? (
                          <Image src={Connector} alt="connector" className="ml-8 -my-0.5" />
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="activities">
                {activities.length === 0 ? (
                  <EmptyPanel
                    title="No activity recorded"
                    message="No additional activity has been recorded for this disbursement yet."
                  />
                ) : (
                  <div className="space-y-5">
                    {activities.map((activity, index) => (
                      <Fragment key={activity.id}>
                        <ActivityCard activity={activity} />
                        {index < activities.length - 1 ? (
                          <Image src={Connector} alt="connector" className="ml-8 -my-0.5" />
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                )}
              </Tabs.Panel>
            </Tabs>
          </div>

          {canAct ? (
            <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-6 py-4">
              <CustomButton buttonType="primary" onClick={() => setFlow("approve")}>
                Complete Review
              </CustomButton>
              <Button
                variant="outline"
                color="red"
                radius="xl"
                onClick={() => setFlow("reject")}
              >
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      </Drawer>

      <ApprovalActionConfirmModal
        opened={flow === "approve"}
        onClose={() => setFlow(null)}
        title="Complete Review ?"
        message="You are about to approve this disbursement stage. Once confirmed, your review will be recorded and passed on to the next stage for approval."
        primaryButtonText="Yes, Complete Review"
        secondaryButtonText="No, Close"
        commentRequired={false}
        isLoading={submitting && flow === "approve"}
        onConfirm={(comment) => {
          void runAction(() => onApprove(comment), "approve");
        }}
      />

      <ApprovalActionConfirmModal
        opened={flow === "reject"}
        onClose={() => setFlow(null)}
        title="Reject Disbursement?"
        message="You are about to reject this disbursement. Once confirmed, the disbursement will be declined and no further processing will take place."
        primaryButtonText="Yes, Reject Disbursement"
        secondaryButtonText="No, Close"
        isLoading={submitting && flow === "reject"}
        onConfirm={(comment) => {
          void runAction(() => onReject(comment), "reject");
        }}
      />

      <SuccessModal
        opened={successFlow === "approve"}
        onClose={() => setSuccessFlow(null)}
        zIndex={4100}
        title="Review Completed"
        message="The review has been successfully completed and forwarded to the next stage for review or approval"
        primaryButtonText="Close"
        onPrimaryClick={() => setSuccessFlow(null)}
      />

      <SuccessModal
        opened={successFlow === "reject"}
        onClose={() => setSuccessFlow(null)}
        zIndex={4100}
        title="Disbursement Rejected"
        message="The disbursement has been successfully rejected and will not proceed"
        primaryButtonText="Close"
        onPrimaryClick={() => setSuccessFlow(null)}
      />
    </>
  );
}
