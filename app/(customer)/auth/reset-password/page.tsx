"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPSentModal } from "@/app/(customer)/_components/modals/OTPSentModal";
import { TextInput, Button, Anchor } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpSentOpened, { open: openOTPSent, close: closeOTPSent }] =
    useDisclosure(false);

  const handleResetPassword = () => {
    if (email) {
      // Store email in sessionStorage for the verify OTP page
      sessionStorage.setItem("resetEmail", email);
      openOTPSent();
    }
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
          disabled={!email}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Reset Password
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
