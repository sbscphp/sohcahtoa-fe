"use client";

import { Button, Modal, Text, TextInput } from "@mantine/core";
import Image from "next/image";
import { exclamation } from "@/app/assets/asset";
import { useEffect, useState } from "react";

interface ConfirmDisbursementModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (sessionId: string) => void;
  isLoading?: boolean;
  zIndex?: number;
}

export function ConfirmDisbursementModal({
  opened,
  onClose,
  onConfirm,
  isLoading = false,
  zIndex = 4000,
}: ConfirmDisbursementModalProps) {
  const [sessionId, setSessionId] = useState("");

  const handleModalClose = () => {
    if (isLoading) return;
    setSessionId("");
    onClose();
  };

  const handlePrimary = () => {
    if (isLoading) return;
    const trimmed = sessionId.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  useEffect(() => {
    if (!opened && sessionId !== "") {
      setTimeout(() => {
        setSessionId("");
      }, 0);
    }
  }, [opened, sessionId]);

  return (
    <Modal
      opened={opened}
      onClose={handleModalClose}
      withCloseButton={false}
      centered
      radius="lg"
      padding="xl"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      overlayProps={{ opacity: 0.3, blur: 2 }}
      zIndex={zIndex}
    >
      <div className="flex flex-col items-center space-y-5">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0E5]">
            <Image src={exclamation} alt="" width={40} height={40} />
          </div>
        </div>
        <h2 className="text-center text-xl font-bold text-body-heading-300!">
          Confirm Disbursement?
        </h2>
        <p className="w-full px-2 text-center text-body-text-100! text-sm leading-relaxed">
          Are you sure you want to confirm disbursement for this transaction?
          This action can not be undone.
        </p>
        <div className="w-full space-y-1.5 text-left">
          <Text size="sm" fw={500} className="text-body-heading-300">
            Session ID{" "}
            <span className="text-red-500" aria-hidden>
              *
            </span>
          </Text>
          <TextInput
            placeholder="Enter session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.currentTarget.value)}
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
            disabled={!sessionId.trim() || isLoading}
            loading={isLoading}
            className="font-medium! text-sm!"
          >
            Yes, Confirm Disbursement
          </Button>
          <Button
            fullWidth
            radius="xl"
            size="md"
            variant="outline"
            color="gray"
            onClick={handleModalClose}
            disabled={isLoading}
            className="border-text-50! border! font-semibold! text-sm!"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
