"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";

import { AgentAuthLayout } from "@/app/agent/_components/auth/AuthLayout";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { ErrorModal } from "@/app/admin/_components/ErrorModal";
import { EmailForm } from "./_components/EmailForm";
import { OtpForm } from "@/app/admin/reset-password/_components/OtpForm";
import { CreatePasswordForm } from "@/app/admin/reset-password/_components/CreatePasswordForm";
import type {
  EmailFormValues,
  CreatePasswordFormValues,
} from "@/app/admin/reset-password/_schemas/resetPassword.schema";

type Step = "email" | "otp" | "password";

export default function AgentForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [otpSentModalOpened, setOtpSentModalOpened] = useState(false);
  const [otpSuccessModalOpened, setOtpSuccessModalOpened] = useState(false);
  const [otpErrorModalOpened, setOtpErrorModalOpened] = useState(false);
  const [passwordCreatedModalOpened, setPasswordCreatedModalOpened] =
    useState(false);

  const forgotPasswordMutation = useCreateData(customerApi.auth.forgotPassword);
  const verifyResetOtpMutation = useCreateData(customerApi.auth.verifyResetOtp);
  const resetPasswordMutation = useCreateData(customerApi.auth.resetPassword);

  useEffect(() => {
    if (currentStep === "otp" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

  const handleEmailSubmit = (values: EmailFormValues) => {
    setUserEmail(values.email);
    setEmailLoading(true);
    forgotPasswordMutation.mutate(
      { email: values.email },
      {
        onSuccess: () => {
          setOtpSentModalOpened(true);
        },
        onError: () => {
          setOtpErrorModalOpened(true);
        },
        onSettled: () => {
          setEmailLoading(false);
        },
      }
    );
  };

  const handlePasswordSubmit = (values: CreatePasswordFormValues) => {
    setPasswordLoading(true);
    resetPasswordMutation.mutate(
      { resetToken, newPassword: values.password },
      {
        onSuccess: () => {
          setPasswordCreatedModalOpened(true);
        },
        onError: () => {
          setOtpErrorModalOpened(true);
        },
        onSettled: () => {
          setPasswordLoading(false);
        },
      }
    );
  };

  const handleOtpSentModalClose = () => {
    setOtpSentModalOpened(false);
    setCurrentStep("otp");
    setTimeLeft(600);
  };

  const handleOtpSuccessModalClose = () => {
    setOtpSuccessModalOpened(false);
    setCurrentStep("password");
  };

  const handleResendOtp = () => {
    setOtp("");
    setTimeLeft(600);
    setResendLoading(true);
    forgotPasswordMutation.mutate(
      { email: userEmail },
      {
        onSettled: () => {
          setResendLoading(false);
        },
      }
    );
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) return;
    setOtpLoading(true);
    verifyResetOtpMutation.mutate(
      { email: userEmail, otp },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            setResetToken(response.data.resetToken);
            setOtpSuccessModalOpened(true);
          } else {
            setOtpErrorModalOpened(true);
          }
        },
        onError: () => {
          setOtpErrorModalOpened(true);
        },
        onSettled: () => {
          setOtpLoading(false);
        },
      }
    );
  };

  return (
    <AgentAuthLayout>
      {currentStep === "email" && (
        <EmailForm
          onSubmit={handleEmailSubmit}
          isLoading={emailLoading}
        />
      )}

      {currentStep === "otp" && (
        <OtpForm
          email={userEmail}
          otp={otp}
          onOtpChange={setOtp}
          onSubmit={handleOtpSubmit}
          onResend={handleResendOtp}
          timeLeft={timeLeft}
          isLoading={otpLoading}
          isResending={resendLoading}
        />
      )}

      {currentStep === "password" && (
        <CreatePasswordForm
          onSubmit={handlePasswordSubmit}
          isLoading={passwordLoading}
        />
      )}

      <SuccessModal
        opened={otpSentModalOpened}
        onClose={handleOtpSentModalClose}
        title="OTP Code Sent"
        message="A six digit OTP verification code has been sent to your email."
        primaryButtonText="Continue →"
        onPrimaryClick={handleOtpSentModalClose}
      />

      <SuccessModal
        opened={otpSuccessModalOpened}
        onClose={handleOtpSuccessModalClose}
        title="Validation successful"
        message="You have successfully verified your account."
        primaryButtonText="Continue"
        onPrimaryClick={handleOtpSuccessModalClose}
      />

      <ErrorModal
        opened={otpErrorModalOpened}
        onClose={() => {
          setOtpErrorModalOpened(false);
          setOtp("");
        }}
        title="OTP Validation Failed"
        message="The OTP entered is incorrect or expired. Kindly check the OTP code entered and try again."
        buttonText="Close"
        onButtonClick={() => {
          setOtpErrorModalOpened(false);
          setOtp("");
        }}
      />

      <SuccessModal
        opened={passwordCreatedModalOpened}
        onClose={() => {
          setPasswordCreatedModalOpened(false);
          router.push("/agent/auth/login");
        }}
        title="New Password Created"
        message="Your password has been reset successfully."
        primaryButtonText="Return To Log In"
        onPrimaryClick={() => {
          setPasswordCreatedModalOpened(false);
          router.push("/agent/auth/login");
        }}
      />
    </AgentAuthLayout>
  );
}
