"use client";

import { useState, useEffect } from "react";
import { TextInput, PasswordInput, Anchor, PinInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/app/admin/_components/auth/AuthLayout";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { ErrorModal } from "@/app/admin/_components/ErrorModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import {
  emailSchema,
  createPasswordSchema,
  checkPasswordRequirements,
  type EmailFormValues,
  type CreatePasswordFormValues,
} from "./_schemas/forgotPassword.schema";
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

  // Email form
  const emailForm = useForm<EmailFormValues>({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: zod4Resolver(emailSchema),
    validateInputOnChange: true,
  });

  // Password form
  const passwordForm = useForm<CreatePasswordFormValues>({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(createPasswordSchema),
    validateInputOnChange: true,
  });

  // Get password for validation indicators
  const currentPassword = passwordForm.getValues().password || "";
  const passwordRequirements = checkPasswordRequirements(currentPassword);

  // API hooks
  const requestPasswordReset = useRequestPasswordReset({
    onSuccess: () => {
      setOtpSentModalOpened(true);
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: () => {
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
  const handleEmailSubmit = emailForm.onSubmit((values) => {
    setUserEmail(values.email);
    requestPasswordReset.mutate(values);
  });

  const handlePasswordSubmit = passwordForm.onSubmit((values) => {
    createNewPassword.mutate(values);
  });

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
    <AuthLayout>
      {/* Step 1: Email Collection Form */}
      {currentStep === "email" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
              Reset Password
            </h1>
            <p className="text-body-text-100 text-base">
              Don&apos;t worry. Enter your email to reset your password.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Email Address
              </label>
              <TextInput
                key={emailForm.key("email")}
                placeholder="Enter email address"
                size="lg"
                {...emailForm.getInputProps("email")}
              />
            </div>

            <div className="flex justify-end">
              <Anchor
                component="button"
                type="button"
                c="red"
                size="sm"
                underline="always"
                onClick={() => router.push(adminRoutes.adminLogin())}
              >
                Return to Login
              </Anchor>
            </div>

            <CustomButton
              buttonType="primary"
              type="submit"
              size="lg"
              radius="xl"
              fullWidth
              loading={requestPasswordReset.isPending}
              disabled={!emailForm.isValid() || requestPasswordReset.isPending}
              className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
            >
              Reset Password →
            </CustomButton>
          </form>
        </div>
      )}

      {/* Step 3: Enter OTP Form (shown after OTP sent modal) */}
      {currentStep === "otp" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
              Reset Password
            </h1>
            <p className="text-body-text-100 text-base">
              Enter the 6-digit OTP sent to your email address associated with
              this account {maskEmail(userEmail)}
            </p>
          </div>

          <div className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center">
              <PinInput
                length={6}
                size="lg"
                value={otp}
                onChange={setOtp}
                oneTimeCode
                type="number"
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
                  onClick={
                    requestPasswordReset.isPending ? undefined : handleResendOtp
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!requestPasswordReset.isPending) handleResendOtp();
                    }
                  }}
                  className={
                    requestPasswordReset.isPending
                      ? "text-error-600/60 cursor-not-allowed"
                      : "text-error-600 cursor-pointer font-medium underline"
                  }
                  aria-disabled={requestPasswordReset.isPending}
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
              loading={verifyOtp.isPending}
              disabled={otp.length !== 6 || verifyOtp.isPending}
              onClick={handleOtpSubmit}
              className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
            >
              Continue →
            </CustomButton>
          </div>
        </div>
      )}

      {/* Step 5: Create New Password Form */}
      {currentStep === "password" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
              Create New Password
            </h1>
            <p className="text-body-text-100 text-base">
              This password will be used every time you sign in. Make sure it&apos;s
              unique and secure for you.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Password
              </label>
              <PasswordInput
                key={passwordForm.key("password")}
                placeholder="Enter password"
                size="lg"
                {...passwordForm.getInputProps("password")}
              />

              {/* Password requirements indicators */}
              <div className="space-y-1 mt-3">
                <div
                  className={`text-xs ${
                    passwordRequirements.length
                      ? "text-success-600"
                      : "text-body-text-100"
                  }`}
                >
                  {passwordRequirements.length ? "✓" : "•"} 8–12 characters
                </div>
                <div
                  className={`text-xs ${
                    passwordRequirements.uppercase && passwordRequirements.lowercase
                      ? "text-success-600"
                      : "text-body-text-100"
                  }`}
                >
                  {passwordRequirements.uppercase && passwordRequirements.lowercase
                    ? "✓"
                    : "•"}{" "}
                  Use both Uppercase letters [A-Z] and Lowercase letter [a-z]
                </div>
                <div
                  className={`text-xs ${
                    passwordRequirements.number
                      ? "text-success-600"
                      : "text-body-text-100"
                  }`}
                >
                  {passwordRequirements.number ? "✓" : "•"} Include Numbers
                  (0–9)
                </div>
                <div
                  className={`text-xs ${
                    passwordRequirements.special
                      ? "text-success-600"
                      : "text-body-text-100"
                  }`}
                >
                  {passwordRequirements.special ? "✓" : "•"} Special characters
                  [e.g. ! @ # $ % * & *]
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Confirm Password
              </label>
              <PasswordInput
                key={passwordForm.key("confirmPassword")}
                placeholder="Re-enter password"
                size="lg"
                {...passwordForm.getInputProps("confirmPassword")}
              />
            </div>

            <CustomButton
              buttonType="primary"
              type="submit"
              size="lg"
              radius="xl"
              fullWidth
              loading={createNewPassword.isPending}
              disabled={
                !passwordForm.isValid() || createNewPassword.isPending
              }
              className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
            >
              Create Password →
            </CustomButton>
          </form>
        </div>
      )}

      {/* Step 2: OTP Sent Success Modal */}
      <SuccessModal
        opened={otpSentModalOpened}
        onClose={handleOtpSentModalClose}
        title="OTP Code Sent"
        message="A six digit OTP verification code has been sent to your email. Kindly open your email to continue."
        primaryButtonText="Open Email →"
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
