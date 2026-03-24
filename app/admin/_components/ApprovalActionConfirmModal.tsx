"use client";

import { Button, Modal, Text, Textarea } from "@mantine/core";
import Image from "next/image";
import { exclamation } from "@/app/assets/asset";
import { useState } from "react";

export interface ApprovalActionConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onConfirm: (comment: string) => void;
  isLoading?: boolean;
  zIndex?: number;
}

export function ApprovalActionConfirmModal({
  opened,
  onClose,
  title,
  message,
  primaryButtonText,
  secondaryButtonText,
  onConfirm,
  isLoading = false,
  zIndex = 4000,
}: ApprovalActionConfirmModalProps) {
  const [comment, setComment] = useState("");

  const handleModalClose = () => {
    if (isLoading) return;
    setComment("");
    onClose();
  };

  const handlePrimary = () => {
    if (isLoading) return;
    const trimmed = comment.trim();
    if (!trimmed) return;
    setComment("");
    onConfirm(trimmed);
  };

  const handleSecondary = () => {
    handleModalClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleModalClose}
      withCloseButton={false}
      centered
      radius="lg"
      padding="xl"
      zIndex={zIndex}
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      overlayProps={{ opacity: 0.3, blur: 2 }}
    >
      <div className="flex flex-col items-center space-y-5">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0E5]">
            <Image src={exclamation} alt="" width={40} height={40} />
          </div>
        </div>
        <h2 className="text-center text-xl font-bold text-body-heading-300!">
          {title}
        </h2>
        <p className="px-2 text-center text-body-text-100! text-sm leading-relaxed">
          {message}
        </p>
        <div className="w-full space-y-1.5 text-left">
          <Text size="sm" fw={500} className="text-body-heading-300">
            Comment{" "}
            <span className="text-red-500" aria-hidden>
              *
            </span>
          </Text>
          <Textarea
            placeholder="Start Typing"
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            minRows={4}
            radius="md"
            disabled={isLoading}
            classNames={{
              input: "border border-[#CCCACA]! text-sm",
            }}
          />
        </div>
        <div className="mt-2 w-full space-y-3">
          <Button
            fullWidth
            radius="xl"
            size="md"
            color="orange"
            onClick={handlePrimary}
            disabled={!comment.trim() || isLoading}
            loading={isLoading}
            className="font-medium! text-sm!"
          >
            {primaryButtonText}
          </Button>
          <Button
            fullWidth
            radius="xl"
            size="md"
            variant="outline"
            color="gray"
            onClick={handleSecondary}
            disabled={isLoading}
            className="border-text-50! border! font-semibold! text-sm!"
          >
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
