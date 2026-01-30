"use client";

import { Button, Modal, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Success from "../_components/assets/Success.png";


interface OtpSuccessModalProps {
  opened: boolean;
  onClose: () => void;
  props: {
    title?: string;
    description?: string;
    image?: any;
  };
}

export function ModalSuccess({ opened, onClose, props }: OtpSuccessModalProps) {


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
      <Button
          className="  w-full! mt-6! "
          color="#DD4F05"
          variant="outline"
          onClick={onClose}
          
        >
          Close
        </Button>
    </Modal>
  );
}
