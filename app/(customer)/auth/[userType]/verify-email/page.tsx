"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthLayout } from "@/app/(customer)/_components/auth/AuthLayout";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { validateUserType, getNextStep } from "@/app/(customer)/_utils/auth-flow";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);

  useEffect(() => {
    if (!userType) {
      router.push("/auth/onboarding");
    }
  }, [userType, router]);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleVerify = () => {
    if (isComplete && userType) {
      router.push(getNextStep(userType, "verify-email"));
    }
  };

  const handleResend = () => {
    setOtp("");
    setIsComplete(false);
  };

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("email") || "fiy************@gmail.com"
      : "fiy************@gmail.com";

  if (!userType) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Validate Your Email Address
          </h1>
          <p className="text-body-text-100 text-base">
            Enter the 6-digit OTP sent to your email address associated with
            this account {email}
          </p>
        </div>

        <OTPInput
          onComplete={handleOTPComplete}
          onResend={handleResend}
          expiryMinutes={15}
        />

        <Button
          onClick={() => setSuccessOpened(true)}
          disabled={!isComplete}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Verify
        </Button>

        <SecurityBadges />
      </div>

      <SuccessModal
        opened={successOpened}
        onClose={() => setSuccessOpened(false)}
        title="Email Verified Successfully"
        message="Your email has been successfully verified. Continue below to complete account creation. "
        buttonText="Continue"
        onButtonClick={handleVerify}
      />
    </AuthLayout>
  );
}
