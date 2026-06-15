"use client";

import { useState } from "react";
import { Modal, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowUpRight } from "lucide-react";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { handleApiError } from "@/app/_lib/api/error-handler";

function maskEmail(email: string) {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const visible = Math.min(3, at);
  return `${email.slice(0, visible)}${"*".repeat(Math.max(0, at - visible))}${email.slice(at)}`;
}

interface AgentChangePasswordOtpModalProps {
  opened: boolean;
  onClose: () => void;
  onVerified: (resetToken: string) => void;
  email: string;
}

export function AgentChangePasswordOtpModal({
  opened,
  onClose,
  onVerified,
  email,
}: Readonly<AgentChangePasswordOtpModalProps>) {
  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const verifyOtpMutation = useCreateData(agentApi.auth.otp.verifyChangePassword);
  const resendOtpMutation = useCreateData(agentApi.auth.otp.resendChangePassword);

  const deliveryLabel = `email (${maskEmail(email)})`;

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const showDevOtp = (devOtp?: string) => {
    if (!devOtp) return;
    notifications.show({
      title: "DEV OTP",
      message: `OTP: ${devOtp}`,
      color: "blue",
      autoClose: 8000,
    });
  };

  const handleVerify = () => {
    if (!isComplete || verifyOtpMutation.isPending) return;

    verifyOtpMutation.mutate(
      { email, otp },
      {
        onSuccess: (response) => {
          const resetToken = response.data?.resetToken;
          if (response.success && resetToken) {
            setOtp("");
            setIsComplete(false);
            onClose();
            onVerified(resetToken);
            return;
          }
          handleApiError(
            { message: response.error?.message || "Invalid OTP", status: 400 },
            {
              customMessage:
                response.error?.message || "Invalid OTP. Please check and try again.",
            }
          );
        },
        onError: (error) => {
          handleApiError(error, {
            customMessage: "Failed to verify OTP. Please try again.",
          });
        },
      }
    );
  };

  const handleResend = () => {
    if (resendOtpMutation.isPending) return;

    setOtp("");
    setIsComplete(false);

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          if (response.success) {
            showDevOtp(response.data?.otp);
            notifications.show({
              title: "OTP Resent",
              message: response.data?.message || "A new OTP has been sent.",
              color: "green",
            });
            return;
          }
          handleApiError(
            { message: response.error?.message || "Failed to resend OTP", status: 400 },
            { customMessage: response.error?.message || "Failed to resend OTP." }
          );
        },
        onError: (error) => {
          handleApiError(error, { customMessage: "Failed to resend OTP." });
        },
      }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      centered
      radius="xl"
      size="500px"
      withCloseButton={false}
    >
      <div className="space-y-6 p-3">
        <div>
          <h2 className="text-body-heading-200 text-2xl font-semibold">
            Verify OTP
          </h2>
          <p className="mt-1 text-base text-body-text-100">
            Enter the code sent to your {deliveryLabel} to continue changing your
            password.
          </p>
        </div>

        <OTPInput
          onComplete={handleOTPComplete}
          onResend={handleResend}
          maskedInfo={`A six (6) digit OTP has been sent to your ${deliveryLabel}.`}
          isResending={resendOtpMutation.isPending}
        />

        <Button
          onClick={handleVerify}
          disabled={!isComplete || verifyOtpMutation.isPending}
          loading={verifyOtpMutation.isPending}
          variant="filled"
          fullWidth
          radius="xl"
          rightSection={
            !verifyOtpMutation.isPending && <ArrowUpRight size={18} />
          }
          className="h-[52px] min-h-[52px] bg-primary-400 py-3.5 px-6 text-base font-medium leading-6 text-[#FFF6F1] hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-primary-100 disabled:text-white"
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </Modal>
  );
}
