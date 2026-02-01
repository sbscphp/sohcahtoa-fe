"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [otpValidatedOpened, { open: openOTPValidated, close: closeOTPValidated }] =
    useDisclosure(false);

  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from sessionStorage
    const resetEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resetEmail") || ""
        : "";
    setEmail(resetEmail);

    if (!resetEmail) {
      // Redirect if no email found
      router.push("/auth/reset-password");
    }
  }, [router]);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleVerify = () => {
    if (isComplete) {
      openOTPValidated();
    }
  };

  const handleOTPValidatedContinue = () => {
    closeOTPValidated();
    router.push("/auth/reset-password/create-password");
  };

  const handleResend = () => {
    setOtp("");
    setIsComplete(false);
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
          disabled={!isComplete}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Continue
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
