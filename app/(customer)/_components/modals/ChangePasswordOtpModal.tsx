"use client";

import { useState } from "react";
import { Modal, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowUpRight } from "lucide-react";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import type { AuthOtpPurpose } from "@/app/_lib/api/types";

const CHANGE_PASSWORD_PURPOSE: AuthOtpPurpose = "CHANGE_PASSWORD";

function maskEmail(email: string) {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const visible = Math.min(3, at);
  return `${email.slice(0, visible)}${"*".repeat(Math.max(0, at - visible))}${email.slice(at)}`;
}

function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 4)}${"*".repeat(phone.length - 7)}${phone.slice(-3)}`;
}

interface ChangePasswordOtpModalProps {
  opened: boolean;
  onClose: () => void;
  onVerified: () => void;
  email?: string;
  phoneNumber?: string;
}

export function ChangePasswordOtpModal({
  opened,
  onClose,
  onVerified,
  email,
  phoneNumber,
}: ChangePasswordOtpModalProps) {
  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const validateOtpMutation = useCreateData(customerApi.auth.otp.validate);
  const sendOtpMutation = useCreateData(customerApi.auth.otp.send);

  const deliveryLabel = email
    ? `email (${maskEmail(email)})`
    : phoneNumber
      ? `phone number (${maskPhone(phoneNumber)})`
      : "registered contact";

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const buildSendPayload = () => {
    if (email) return { email, purpose: CHANGE_PASSWORD_PURPOSE };
    if (phoneNumber) return { phoneNumber, purpose: CHANGE_PASSWORD_PURPOSE };
    return null;
  };

  const handleVerify = () => {
    if (!isComplete || validateOtpMutation.isPending) return;

    validateOtpMutation.mutate(
      {
        otp,
        purpose: CHANGE_PASSWORD_PURPOSE,
        ...(email ? { email } : {}),
        ...(phoneNumber && !email ? { phoneNumber } : {}),
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data?.valid) {
            setOtp("");
            setIsComplete(false);
            onClose();
            onVerified();
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
    const payload = buildSendPayload();
    if (!payload || sendOtpMutation.isPending) return;

    setOtp("");
    setIsComplete(false);

    sendOtpMutation.mutate(payload, {
      onSuccess: (response) => {
        if (response.success) {
          const devOtp = (response.data as { otp?: string } | undefined)?.otp;
          if (devOtp) {
            notifications.show({
              title: "DEV OTP",
              message: `OTP: ${devOtp}`,
              color: "blue",
              autoClose: 8000,
            });
          }
          notifications.show({
            title: "OTP Resent",
            message: response.data?.message || "A new OTP has been sent.",
            color: "green",
          });
        } else {
          handleApiError(
            { message: response.error?.message || "Failed to resend OTP", status: 400 },
            { customMessage: response.error?.message || "Failed to resend OTP." }
          );
        }
      },
      onError: (error) => {
        handleApiError(error, { customMessage: "Failed to resend OTP." });
      },
    });
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
          isResending={sendOtpMutation.isPending}
        />

        <Button
          onClick={handleVerify}
          disabled={!isComplete || validateOtpMutation.isPending}
          loading={validateOtpMutation.isPending}
          variant="filled"
          fullWidth
          radius="xl"
          rightSection={
            !validateOtpMutation.isPending && <ArrowUpRight size={18} />
          }
          className="h-[52px] min-h-[52px] bg-primary-400 py-3.5 px-6 text-base font-medium leading-6 text-[#FFF6F1] hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-primary-100 disabled:text-white"
        >
          {validateOtpMutation.isPending ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </Modal>
  );
}
