"use client";

import { PinInput, Text } from "@mantine/core";
import { CustomButton } from "@/app/admin/_components/CustomButton";

interface OtpFormProps {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  timeLeft: number;
  isLoading?: boolean;
  isResending?: boolean;
}

export function OtpForm({
  email,
  otp,
  onOtpChange,
  onSubmit,
  onResend,
  timeLeft,
  isLoading = false,
  isResending = false,
}: OtpFormProps) {
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-3);
    return `${visibleStart}*******${visibleEnd}@${domain}`;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
          Reset Password
        </h1>
        <p className="text-body-text-100 text-base">
          Enter the 6-digit OTP sent to your email address associated with this
          account {maskEmail(email)}
        </p>
      </div>

      <div className="space-y-6">
        {/* OTP Input */}
        <div className="flex justify-center">
          <PinInput
            length={6}
            size="lg"
            value={otp}
            onChange={onOtpChange}
            oneTimeCode
            type="alphanumeric"
            className="gap-3"
          />
        </div>

        {/* Timer and Resend */}
        <div className="flex flex-col gap-3 items-center">
          <Text className="text-body-text-100! text-sm!">
            OTP expires in{" "}
            <span className="text-error-600 font-semibold">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </Text>

          <Text className="text-body-text-100! text-sm!">
            Didn&apos;t Receive Code?{" "}
            <span
              role="button"
              tabIndex={0}
              onClick={isResending ? undefined : onResend}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isResending) onResend();
                }
              }}
              className={
                isResending
                  ? "text-error-600/60 cursor-not-allowed"
                  : "text-error-600 cursor-pointer font-medium underline"
              }
              aria-disabled={isResending}
            >
              Resend OTP
            </span>
          </Text>
        </div>

        {/* Continue Button */}
        <CustomButton
          buttonType="primary"
          type="button"
          size="lg"
          radius="xl"
          fullWidth
          loading={isLoading}
          disabled={otp.length !== 6 || isLoading}
          onClick={onSubmit}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Continue →
        </CustomButton>
      </div>
    </div>
  );
}
