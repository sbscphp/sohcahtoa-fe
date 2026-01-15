import { Card, Stack, Text, Title } from "@mantine/core";
import Success from "../_components/assets/Success.png"
import Image from "next/image";

export function OtpSuccess() {
  return (
    <Card radius="lg" p="xl" w={420}>
      <Stack align="center" gap="sm">
        <Image
        src={Success}
        alt="Success" />
        <Title order={4}>Validation successful</Title>
        <Text size="sm" c="dimmed" ta="center">
          You have successfully logged in to your account.
        </Text>
      </Stack>
    </Card>
  );
}
