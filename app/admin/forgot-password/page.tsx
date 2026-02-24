"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/app/admin/_components/auth/AuthLayout";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { ErrorModal } from "@/app/admin/_components/ErrorModal";
import { EmailForm } from "./_components/EmailForm";
import { OtpForm } from "./_components/OtpForm";
import { CreatePasswordForm } from "./_components/CreatePasswordForm";
import { type EmailFormValues, type CreatePasswordFormValues } from "./_schemas/forgotPassword.schema";
import { useRequestPasswordReset } from "./hooks/useRequestPasswordReset";
import { useVerifyOtp } from "./hooks/useVerifyOtp";
import { useCreateNewPassword } from "./hooks/useCreateNewPassword";
import { adminRoutes } from "@/lib/adminRoutes";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Modal states
  const [otpSentModalOpened, setOtpSentModalOpened] = useState(false);
  const [otpSuccessModalOpened, setOtpSuccessModalOpened] = useState(false);
  const [otpErrorModalOpened, setOtpErrorModalOpened] = useState(false);
  const [passwordCreatedModalOpened, setPasswordCreatedModalOpened] =
    useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    if (currentStep === "otp" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

  // API hooks
  const requestPasswordReset = useRequestPasswordReset({
    onSuccess: () => {
      setOtpSentModalOpened(true);
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: (data) => {
      setResetToken(data.data.resetToken);
      setOtpSuccessModalOpened(true);
    },
    onError: () => {
      setOtpErrorModalOpened(true);
    },
  });

  const createNewPassword = useCreateNewPassword({
    onSuccess: () => {
      setPasswordCreatedModalOpened(true);
    },
  });

  // Form handlers
  const handleEmailSubmit = (values: EmailFormValues) => {
    setUserEmail(values.email);
    requestPasswordReset.mutate(values);
  };

  const handlePasswordSubmit = (values: CreatePasswordFormValues) => {
    createNewPassword.mutate({ resetToken, password: values.password });
  };

  const handleOtpSentModalClose = () => {
    setOtpSentModalOpened(false);
    setCurrentStep("otp");
    setTimeLeft(600); // Reset timer to 10 minutes
  };

  const handleOtpSuccessModalClose = () => {
    setOtpSuccessModalOpened(false);
    setCurrentStep("password");
  };

  const handleResendOtp = () => {
    setOtp(""); // Clear OTP input
    setTimeLeft(600); // Reset timer
    requestPasswordReset.mutate({ email: userEmail });
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      verifyOtp.mutate(otp);
    }
  };

  return (
    <AuthLayout>
      {/* Step 1: Email Collection Form */}
      {currentStep === "email" && (
        <EmailForm
          onSubmit={handleEmailSubmit}
          isLoading={requestPasswordReset.isPending}
        />
      )}

      {/* Step 3: Enter OTP Form */}
      {currentStep === "otp" && (
        <OtpForm
          email={userEmail}
          otp={otp}
          onOtpChange={setOtp}
          onSubmit={handleOtpSubmit}
          onResend={handleResendOtp}
          timeLeft={timeLeft}
          isLoading={verifyOtp.isPending}
          isResending={requestPasswordReset.isPending}
        />
      )}

      {/* Step 5: Create New Password Form */}
      {currentStep === "password" && (
        <CreatePasswordForm
          onSubmit={handlePasswordSubmit}
          isLoading={createNewPassword.isPending}
        />
      )}

      {/* Step 2: OTP Sent Success Modal */}
      <SuccessModal
        opened={otpSentModalOpened}
        onClose={handleOtpSentModalClose}
        title="OTP Code Sent"
        message="A six digit OTP verification code has been sent to your email."
        primaryButtonText="Continue →"
        onPrimaryClick={handleOtpSentModalClose}
      />

      {/* Step 4: OTP Success Modal */}
      <SuccessModal
        opened={otpSuccessModalOpened}
        onClose={handleOtpSuccessModalClose}
        title="Validation successful"
        message="You have successfully verified your account."
        primaryButtonText="Continue"
        onPrimaryClick={handleOtpSuccessModalClose}
      />

      {/* Step 4: OTP Error Modal */}
      <ErrorModal
        opened={otpErrorModalOpened}
        onClose={() => {
          setOtpErrorModalOpened(false);
          setOtp(""); // Clear OTP input
        }}
        title="OTP Validation Failed"
        message="The OTP entered is incorrect or expired. Kindly check the OTP code entered and try again."
        buttonText="Close"
        onButtonClick={() => {
          setOtpErrorModalOpened(false);
          setOtp(""); // Clear OTP input
        }}
      />

      {/* Step 6: Password Created Success Modal */}
      <SuccessModal
        opened={passwordCreatedModalOpened}
        onClose={() => {
          setPasswordCreatedModalOpened(false);
          router.push(adminRoutes.adminLogin());
        }}
        title="New Password Created"
        message="Your password has been reset successfully."
        primaryButtonText="Return To Log In"
        onPrimaryClick={() => {
          setPasswordCreatedModalOpened(false);
          router.push(adminRoutes.adminLogin());
        }}
      />
    </AuthLayout>
  );
}
