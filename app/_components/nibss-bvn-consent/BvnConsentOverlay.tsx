"use client";

import { Button, Modal, Text } from "@mantine/core";
import { ExternalLink, Loader2 } from "lucide-react";
import type { BvnConsentFlowPhase } from "@/app/_lib/nibss-bvn-consent/types";

type BvnConsentOverlayProps = {
  opened: boolean;
  phase: BvnConsentFlowPhase;
  statusMessage?: string | null;
  usedPopup?: boolean;
  onOpenPortal: () => void;
  onRetry: () => void;
  onCancel: () => void;
};

export function BvnConsentOverlay({
  opened,
  phase,
  statusMessage,
  usedPopup = true,
  onOpenPortal,
  onRetry,
  onCancel,
}: Readonly<BvnConsentOverlayProps>) {
  const isWaiting = phase === "initiating" || phase === "polling";
  const canRetry = phase === "failed" || phase === "timed_out";

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      centered
      closeOnClickOutside={false}
      closeOnEscape={!isWaiting}
      withCloseButton={!isWaiting}
      title="Complete BVN consent"
      radius="lg"
      size="md"
    >
      <div className="space-y-4 py-2">
        {isWaiting && (
          <div className="flex items-start gap-3 rounded-xl border border-[#E1E0E0] bg-[#FFF6F1] p-4">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary-400" />
            <div className="space-y-1">
              <Text className="text-body-heading-300 font-medium">
                {phase === "initiating"
                  ? "Starting NIBSS consent…"
                  : "Waiting for NIBSS consent"}
              </Text>
              <Text size="sm" className="text-body-text-200">
                {statusMessage ??
                  "Complete the consent prompt in the NIBSS window. This page will update automatically."}
              </Text>
            </div>
          </div>
        )}

        {canRetry && (
          <div className="space-y-2 rounded-xl border border-error-100 bg-error-50 p-4">
            <Text className="text-body-heading-300 font-medium">
              Consent not confirmed yet
            </Text>
            <Text size="sm" className="text-body-text-200">
              {statusMessage ??
                "We could not confirm your BVN consent. You can reopen NIBSS or try checking again."}
            </Text>
          </div>
        )}

        {!usedPopup && isWaiting && (
          <Text size="sm" className="text-body-text-200">
            You were redirected to NIBSS. Return here after completing consent.
          </Text>
        )}

        <div className="flex flex-col gap-3 pt-1">
          {canRetry && (
            <Button
              variant="filled"
              radius="xl"
              size="md"
              className="bg-primary-400 hover:bg-primary-500 w-full"
              onClick={onRetry}
            >
              Check again
            </Button>
          )}

          {(isWaiting || canRetry) && (
            <Button
              variant="outline"
              radius="xl"
              size="md"
              leftSection={<ExternalLink size={16} />}
              onClick={onOpenPortal}
              className="w-full"
            >
              {usedPopup ? "Reopen NIBSS window" : "Open NIBSS consent"}
            </Button>
          )}

          <Button
            variant="subtle"
            radius="xl"
            size="md"
            onClick={onCancel}
            className="w-full"
            disabled={phase === "initiating"}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
