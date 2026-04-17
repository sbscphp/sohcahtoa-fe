"use client";

import { CONFIRM_INFO_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";
import type { TransactionNoticeItem } from "@/app/(customer)/_lib/transaction-initiate-notices";
import {
  CheckmarkBadge02Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Checkbox, Modal } from "@mantine/core";
import { useState } from "react";

export type { TransactionNoticeItem } from "@/app/(customer)/_lib/transaction-initiate-notices";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** Shown in the default layout; omitted when `notices` is set. */
  description?: string;
  /** Rich layout: subtitle, gray panel rows, header row with icon + close. */
  notices?: TransactionNoticeItem[];
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "warning" | "info" | "danger";
  /** When true, user must check "I confirm that the information I have provided is correct" before continuing. */
  requireInfoConfirmation?: boolean;
  /** Show loading state on confirm button */
  loading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  title,
  description = "",
  notices,
  subtitle = "Kindly note the following",
  confirmLabel = "Continue",
  cancelLabel = "No, Close",
  onConfirm,
  onCancel,
  variant = "warning",
  requireInfoConfirmation = false,
  loading = false,
}: ConfirmationModalProps) {
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setInfoConfirmed(false);
  };

  const iconBgColor =
    variant === "warning"
      ? "bg-warning-50"
      : variant === "danger"
        ? "bg-error-50"
        : "bg-[#F8DCCD]";

  const iconColor =
    variant === "warning"
      ? "text-warning-700"
      : variant === "danger"
        ? "text-error-500"
        : "text-primary-400";

  const canConfirm = !requireInfoConfirmation || infoConfirmed;
  const richLayout = Boolean(notices?.length);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        handleOpenChange(false);
        onClose();
      }}
      centered
      withCloseButton={false}
      radius={30}
      size="sm"
      padding={0}
      classNames={{
        content: "bg-[#FAFAFA] max-w-[min(358px,calc(100vw-32px))] overflow-hidden",
        body: "p-0",
      }}
    >
      {richLayout ? (
        <div className="flex flex-col gap-4 px-4 pb-5 pt-5">
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F1F1]">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={24}
                className="text-[#FF6813] rotate-180"
              />
            </div>
            <h2 className="min-w-0 flex-1 text-center text-[18px] font-semibold leading-[140%] text-[#232323]">
              {title}
            </h2>
            {/* <ActionIcon
              type="button"
              variant="transparent"
              size={40}
              radius="xl"
              aria-label="Close"
              onClick={handleCancel}
              className="shrink-0 text-[#232323] hover:bg-black/5"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </ActionIcon> */}
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-normal leading-[140%] text-[#6C6969]">
              {subtitle}
            </p>

            <div className="flex flex-col gap-5 rounded-[20px] bg-[#F1F1F1] p-3">
              {(notices ?? []).map((item, index) => {
                const kind = item.icon ?? (index === 0 ? "verify" : "currency");
                return (
                  <div key={`${item.title}-${index}`} className="flex flex-row gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAFAFA]">
                      {kind === "verify" ? (
                        <HugeiconsIcon
                          icon={CheckmarkBadge02Icon}
                          size={18}
                          className="text-[#232323]"
                        />
                      ) : (
                        <span className="text-lg font-normal leading-[120%] text-[#232323]">
                          $
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <p className="text-sm font-medium leading-[120%] text-[#232323]">
                        {item.title}
                      </p>
                      <p className="text-xs font-normal leading-[120%] text-[#666666]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {requireInfoConfirmation && (
            <Checkbox
              checked={infoConfirmed}
              onChange={(e) => setInfoConfirmed(e.currentTarget.checked)}
              label={CONFIRM_INFO_MESSAGE}
              className="w-full"
              size="md"
            />
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={onConfirm}
              variant="filled"
              fullWidth
              radius={999}
              disabled={!canConfirm || loading}
              loading={loading}
              className="!h-[52px] !min-h-[52px] !border-0 !border-b-2 !border-b-[#F0CEBD] !bg-[#FF6813] !px-3 !py-4 text-sm font-medium leading-[140%] !text-[#FAFAFA] !shadow-[0px_2px_2px_rgba(35,35,35,0.05)] hover:!bg-[#e85a0f] disabled:!opacity-50"
            >
              {confirmLabel}
            </Button>
            <Button
              onClick={handleCancel}
              variant="filled"
              fullWidth
              radius={999}
              disabled={loading}
              className="!h-[52px] !min-h-[52px] !border-0 !bg-[#F3F3F3] !px-3 !py-4 text-sm font-medium leading-[140%] !text-[#323131] hover:!bg-[#e8e8e8]"
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6 px-4 py-4">
          <div
            className={`${iconBgColor} flex h-20 w-20 shrink-0 flex-row items-center justify-center rounded-full p-4`}
          >
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={48}
              className={iconColor}
            />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-body-heading-300 text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p className="text-body-text-200 text-sm">{description}</p>
            ) : null}
          </div>

          {requireInfoConfirmation && (
            <Checkbox
              checked={infoConfirmed}
              onChange={(e) => setInfoConfirmed(e.currentTarget.checked)}
              label={CONFIRM_INFO_MESSAGE}
              className="w-full"
              size="md"
            />
          )}

          <div className="flex w-full flex-col items-stretch gap-4">
            <Button
              onClick={onConfirm}
              variant="filled"
              fullWidth
              radius="xl"
              disabled={!canConfirm || loading}
              loading={loading}
              className="h-[52px] min-h-[52px] bg-primary-400 px-6 py-3.5 text-base font-medium leading-6 text-[#FFF6F1] hover:bg-primary-500 disabled:opacity-50"
            >
              {confirmLabel}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              fullWidth
              radius="xl"
              disabled={loading}
              className="h-[52px] min-h-[52px] border border-[#CCCACA] bg-white px-6 py-3.5 text-base font-medium leading-6 text-[#4D4B4B] hover:bg-gray-50"
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
