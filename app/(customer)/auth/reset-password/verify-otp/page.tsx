"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { clearPasswordResetSessionStorage, AUTH_STORAGE_KEYS } from "@/app/(customer)/_utils/auth-flow";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [otpValidatedOpened, { open: openOTPValidated, close: closeOTPValidated }] =
    useDisclosure(false);

  const [email, setEmail] = useState("");

  const verifyOtpMutation = useCreateData(customerApi.auth.verifyResetOtp);

  useEffect(() => {
    // Get email from sessionStorage
    const resetEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resetEmail") || ""
        : "";
    setEmail(resetEmail);

    if (!resetEmail) {
      // Redirect if no email found and clear any stale data
      clearPasswordResetSessionStorage();
      router.push("/auth/reset-password");
    }

    // Cleanup on unmount if user navigates away
    return () => {
      // Only clear if user navigates away without completing (no resetToken)
      if (typeof window !== "undefined" && !sessionStorage.getItem("resetToken")) {
        // Don't clear here - let it persist for the create-password page
        // Only clear if explicitly abandoning
      }
    };
  }, [router]);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleVerify = () => {
    if (isComplete && !isValidating && email) {
      setIsValidating(true);
      verifyOtpMutation.mutate(
        { email, otp },
        {
          onSuccess: (response) => {
            if (response.success && response.data?.resetToken) {
              // Store resetToken for the create password page
              sessionStorage.setItem("resetToken", response.data.resetToken);
              setIsValidating(false);
              openOTPValidated();
            } else {
              setIsValidating(false);
              handleApiError(
                { message: response.error?.message || "Invalid OTP", status: 400 },
                { customMessage: response.error?.message || "Invalid OTP. Please check and try again." }
              );
            }
          },
          onError: (error) => {
            setIsValidating(false);
            handleApiError(error, { customMessage: "Failed to verify OTP. Please try again." });
          },
        }
      );
    }
  };

  const handleOTPValidatedContinue = () => {
    closeOTPValidated();
    router.push("/auth/reset-password/create-password");
  };

  const handleResend = async () => {
    if (!email) return;
    
    // Call forgotPassword API again to resend OTP
    try {
      const response = await customerApi.auth.forgotPassword({ email });
      if (response.success) {
        setOtp("");
        setIsComplete(false);
        // OTP sent successfully
      }
    } catch (error) {
      handleApiError(error, { customMessage: "Failed to resend OTP. Please try again." });
    }
  };

  const maskedEmail = email
    ? `${email.slice(0, 3)}${"*".repeat(Math.max(0, email.indexOf("@") - 3))}${email.slice(email.indexOf("@"))}`
    : "";

  if (!email) {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Reset Your Password
          </h1>
          <p className="text-body-text-100 text-base">
            Enter the 6-digit OTP sent to your email address associated with
            this account {maskedEmail}
          </p>
        </div>

        <OTPInput
          onComplete={handleOTPComplete}
          onResend={handleResend}
          expiryMinutes={15}
        />

        <Button
          onClick={handleVerify}
          disabled={!isComplete || isValidating}
          loading={isValidating}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={!isValidating && <ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          {isValidating ? "Verifying..." : "Continue"}
        </Button>

        <SecurityBadges />
      </div>

      <SuccessModal
        opened={otpValidatedOpened}
        onClose={closeOTPValidated}
        title="OTP Code Validated"
        message="OTP Code has been successfully validated."
        buttonText="Continue"
        onButtonClick={handleOTPValidatedContinue}
        buttonVariant="outline"
      />
    </>
  );
}
