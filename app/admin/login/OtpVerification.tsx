"use client";

import { Card, Text, Title, Stack, PinInput } from "@mantine/core";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { useEffect, useState } from "react";

interface Props {
  email: string;
  loading?: boolean;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export function OtpVerification({
  // email,
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
      <Stack align="left">
        <Title order={3} className="ml-2!" >Account Authorisation Access</Title>

        <Text size="sm" c="dimmed" ta="center">
          A six (6) digit OTP has been sent to your email linked to this account.  e*****sohcahtoa.com. Enter code to log in
        </Text>

        <PinInput
          length={6}
          size="lg"
          value={otp}
          onChange={setOtp}
          oneTimeCode
          className="font-bold text-4xl"
        />
        <div className="flex flex-col gap-5 justify-center items-center">

        <Text size="xs" c="dimmed">
          OTP expires in{" "}
          <b className="text-red-500">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </b>
        </Text>

        <Text size="xs" c={"#6C6969"}>
          Didn’t Receive Code?{" "}
          <span
            onClick={onResend}
            className="text-red-500 cursor-pointer font-medium underline"
          >
            Resend OTP
          </span>
        </Text>
        </div>

        <CustomButton
          buttonType="primary"
          fullWidth
          size="lg"
          radius="xl"
          color="#DD4F05"
          loading={loading}
          disabled={otp.length !== 6}
          onClick={() => onVerify(otp)}
        >
          Validate →
        </CustomButton>
      </Stack>
    </Card>
  );
}
