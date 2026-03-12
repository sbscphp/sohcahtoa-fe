"use client";

import { Modal, Text, Title, Stack, PinInput } from "@mantine/core";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { useEffect, useState } from "react";

export interface OtpModalProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Called when the modal is closed (e.g. overlay click, close button) */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Optional short description shown below the title */
  description?: string;
  /** OTP length (number of digits). Default 6 */
  length?: number;
  /** Loading state – disables submit button and resend action */
  loading?: boolean;
  /** Resending state – disables resend action */
  isResending?: boolean;
  /** Called when user submits the OTP (e.g. Validate clicked) */
  onSubmit: (otp: string) => void;
  /** Called when user requests a new OTP (e.g. Resend OTP clicked) */
  onResend: () => Promise<boolean> | boolean;
  /** Countdown duration in seconds. Default 900 (15 min) */
  expiresInSeconds?: number;
}

function OtpModalContent({
  title,
  description,
  length,
  loading,
  isResending,
  onSubmit,
  onResend,
  expiresInSeconds,
}: {
  title: string;
  description?: string;
  length: number;
  loading: boolean;
  isResending: boolean;
  onSubmit: (otp: string) => void;
  onResend: () => Promise<boolean> | boolean;
  expiresInSeconds: number;
}) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const canSubmit = otp.length === length && !loading;
  const isTimerActive = timeLeft > 0;
  const isResendDisabled = isResending || isTimerActive;

  const handleResend = async () => {
    if (isResendDisabled) return;
    const didResendSucceed = await Promise.resolve(onResend());
    if (didResendSucceed) {
      setTimeLeft(expiresInSeconds);
    }
  };

  return (
    <Stack gap="md" p={"md"}>
      <Title order={3}>{title}</Title>

      {description && (
        <Text className="text-body-text-100! text-sm!">{description}</Text>
      )}

      <PinInput
        length={length}
        size="lg"
        value={otp}
        type="number"
        onChange={setOtp}
        oneTimeCode
        className="font-bold text-4xl"
      />

      <div className="flex flex-col gap-5 justify-center items-center">
        <Text className="text-body-text-100! text-sm!">
          OTP expires in{" "}
          <b className="text-error-600">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </b>
        </Text>

        <Text className="text-body-text-100! text-sm!">
          Didn’t Receive Code?{" "}
          <span
              role="button"
              tabIndex={isResendDisabled ? -1 : 0}
              onClick={isResendDisabled ? undefined : handleResend}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isResendDisabled) {
                    void handleResend();
                  }
                }
              }}
              className={
                isResendDisabled
                  ? "text-error-600/60 cursor-not-allowed"
                  : "text-error-600 cursor-pointer font-medium underline"
              }
              aria-disabled={isResendDisabled}
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
        disabled={!canSubmit}
        onClick={() => onSubmit(otp)}
      >
        Validate →
      </CustomButton>
    </Stack>
  );
}

export function OtpModal({
  opened,
  onClose,
  title,
  description,
  length = 6,
  loading = false,
  isResending = false,
  onSubmit,
  onResend,
  expiresInSeconds = 300,
}: OtpModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      radius="lg"
      size="md"
    >
      {opened && (
        <OtpModalContent
          title={title}
          description={description}
          length={length}
          loading={loading}
          isResending={isResending}
          onSubmit={onSubmit}
          onResend={onResend}
          expiresInSeconds={expiresInSeconds}
        />
      )}
    </Modal>
  );
}
