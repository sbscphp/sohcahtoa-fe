"use client";

import { Modal, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Success from "../_components/assets/Success.png";
import { useEffect } from "react";

interface OtpSuccessModalProps {
  opened: boolean;
  onClose: () => void;
  props: {
    title?: string;
    description?: string;
    image?: any;
  };
}

export function ModalConfirmed({ opened, onClose, props }: OtpSuccessModalProps) {

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
        <Image src={props.image || Success} alt="Success" width={120} height={120} priority />

        <Title order={4}>{props.title || "Validation successful"}</Title>
        <Text size="sm" c="dimmed" ta="center">
          {props.description || "You have successfully logged in to your account."}
        </Text>
      </Stack>
    </Modal>
  );
}
