"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPSentModal } from "@/app/(customer)/_components/modals/OTPSentModal";
import { TextInput, Button, Anchor } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { clearPasswordResetSessionStorage, AUTH_STORAGE_KEYS } from "@/app/(customer)/_utils/auth-flow";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [otpSentOpened, { open: openOTPSent, close: closeOTPSent }] =
    useDisclosure(false);

  const forgotPasswordMutation = useCreateData(customerApi.auth.forgotPassword);

  const handleResetPassword = () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          if (response.success) {
            // Clear any previous reset flow data before starting new flow
            clearPasswordResetSessionStorage();
            // Store email in sessionStorage for the verify OTP page
            sessionStorage.setItem("resetEmail", email);
            openOTPSent();
          } else {
            handleApiError(
              { message: response.error?.message || "Failed to send reset OTP", status: 400 },
              { customMessage: response.error?.message || "Please check your email and try again." }
            );
            setError(response.error?.message || "Failed to send reset OTP");
          }
        },
        onError: (error) => {
          handleApiError(error);
          setError(error.message || "Failed to send reset OTP. Please try again.");
        },
      }
    );
  };

  const handleGoToEmail = () => {
    closeOTPSent();
    router.push("/auth/reset-password/verify-otp");
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Reset Password
          </h1>
          <p className="text-body-text-100 text-base">
            Don&apos;t worry. Enter your email to reset your password with ease.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-body-text-100 text-base font-medium">
            Email Address
          </label>
          <TextInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            size="lg"
            error={error}
          />
        </div>

        <div className="flex justify-end">
          <Anchor
            component="button"
            type="button"
            onClick={() => router.push("/auth/login")}
            c="red"
            size="sm"
            underline="always"
          >
            Return to Log In
          </Anchor>
        </div>

        <Button
          onClick={handleResetPassword}
          disabled={!email || forgotPasswordMutation.isPending}
          loading={forgotPasswordMutation.isPending}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={!forgotPasswordMutation.isPending && <ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Reset Password"}
        </Button>

        <SecurityBadges />
      </div>

      <OTPSentModal
        opened={otpSentOpened}
        onClose={closeOTPSent}
        onGoToEmail={handleGoToEmail}
        email={email}
      />
    </>
  );
}
