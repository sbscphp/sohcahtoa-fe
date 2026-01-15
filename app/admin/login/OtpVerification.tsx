"use client";

import {
  Button,
  Card,
  Text,
  Title,
  Stack,
  PinInput,
} from "@mantine/core";
import { useEffect, useState } from "react";

interface Props {
  email: string;
  loading?: boolean;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export function OtpVerification({
  email,
  loading,
  onVerify,
  onResend,
}: Props) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card radius="lg" p="xl" w={420}>
      <Stack align="center">
        <Title order={4}>Account Authorisation Access</Title>

        <Text size="sm" c="dimmed" ta="center">
          A six (6) digit OTP has been sent to your email — <b>{email}</b>
        </Text>

        <PinInput
          length={6}
          size="lg"
          value={otp}
          onChange={setOtp}
          oneTimeCode
        />

        <Text size="xs" c="dimmed">
          OTP expires in{" "}
          <b className="text-red-500">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </b>
        </Text>

        <Text size="xs">
          Didn’t Receive Code?{" "}
          <span
            onClick={onResend}
            className="text-orange-500 cursor-pointer"
          >
            Resend OTP
          </span>
        </Text>

        <Button
          fullWidth
          radius="xl"
          color="orange"
          loading={loading}
          disabled={otp.length !== 6}
          onClick={() => onVerify(otp)}
        >
          Validate →
        </Button>
      </Stack>
    </Card>
  );
}
