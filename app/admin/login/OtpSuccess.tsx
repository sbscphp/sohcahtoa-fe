"use client";

import { Modal, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Success from "../_components/assets/Success.png";
import { useEffect } from "react";

interface OtpSuccessModalProps {
  opened: boolean;
  onClose: () => void;
}

export function OtpSuccess({ opened, onClose }: OtpSuccessModalProps) {

  useEffect(() => {
  if (opened) {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }
}, [opened, onClose]);

  return (
    <Modal
      transitionProps={{ transition: "scale" }}
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      radius="lg"
      size="sm"
    >
      <Stack align="center" gap="sm">
        <Image src={Success} alt="Success" width={120} height={120} priority />

        <Title order={4}>Validation successful</Title>

        <Text size="sm" c="dimmed" ta="center">
          You have successfully logged in to your account.
        </Text>
      </Stack>
    </Modal>
  );
}
