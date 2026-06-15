"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { PasswordInput as MantinePasswordInput, Button } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { Check, Dot } from "lucide-react";
import { PasswordInput as AuthPasswordInput } from "@/app/(customer)/_components/auth/PasswordInput";
import { ChangePasswordOtpModal } from "@/app/(customer)/_components/modals/ChangePasswordOtpModal";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import {
  isPasswordPolicyCompliant,
  passwordLengthOk,
  passwordNumberOk,
  passwordSpecialOk,
  passwordUpperLowerOk,
} from "@/app/_lib/password-policy";

type Step = "old" | "new";

function PasswordVisibilityIcon({ reveal }: { reveal: boolean }) {
  return (
    <HugeiconsIcon
      icon={reveal ? ViewOffIcon : EyeIcon}
      size={20}
      className="text-[#B2AFAF]"
    />
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const userProfile = useAtomValue(userProfileAtom);
  const [step, setStep] = useState<Step>("old");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [otpModalOpened, { open: openOtpModal, close: closeOtpModal }] =
    useDisclosure(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);

  const requestOtpMutation = useCreateData(customerApi.auth.otp.changePassword);
  const resetPasswordMutation = useCreateData(customerApi.auth.resetPassword);

  const email = userProfile?.email;

  const newPasswordValid =
    newPassword.length > 0 &&
    isPasswordPolicyCompliant(newPassword) &&
    newPassword === confirmNewPassword;

  const otpVerified = Boolean(resetToken);

  const isValid =
    step === "old" ? oldPassword.length > 0 : newPasswordValid && otpVerified;

  const inputClassNames = {
    label: "text-sm font-medium leading-5 text-[#6C6969]",
    input:
      "!h-14 !rounded-lg !border-[#CCCACA] !px-3.5 !py-4 !text-base !leading-6 !text-[#1F1E1E] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] placeholder:!text-[#667085]",
  };

  const handleContinueFromOld = () => {
    if (!oldPassword || requestOtpMutation.isPending) return;

    if (!email) {
      notifications.show({
        title: "Email required",
        message:
          "We could not find an email on your profile. Contact support to update your account.",
        color: "red",
      });
      return;
    }

    requestOtpMutation.mutate(
      { email, oldPassword },
      {
        onSuccess: (response) => {
          if (response.success) {
            const devOtp = response.data?.otp;
            if (devOtp) {
              notifications.show({
                title: "DEV OTP",
                message: `OTP: ${devOtp}`,
                color: "blue",
                autoClose: 8000,
              });
            }
            openOtpModal();
            return;
          }
          handleApiError(
            { message: response.error?.message || "Failed to send OTP", status: 400 },
            { customMessage: response.error?.message || "Failed to send OTP." }
          );
        },
        onError: (error) => {
          handleApiError(error, { customMessage: "Failed to send OTP." });
        },
      }
    );
  };

  const handleOtpVerified = (token: string) => {
    setResetToken(token);
    setStep("new");
  };

  const handleCreateNew = () => {
    if (!newPasswordValid || !resetToken || resetPasswordMutation.isPending) {
      return;
    }

    resetPasswordMutation.mutate(
      { resetToken, newPassword },
      {
        onSuccess: (response) => {
          if (response.success) {
            openSuccess();
            return;
          }
          handleApiError(
            {
              message: response.error?.message || "Password change failed",
              status: 400,
            },
            {
              customMessage:
                response.error?.message || "Unable to change password.",
            }
          );
        },
        onError: (error) => {
          handleApiError(error, {
            customMessage: "Unable to change password. Please try again.",
          });
        },
      }
    );
  };

  const handleBackToOldStep = () => {
    setStep("old");
    setResetToken(null);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleSuccessClose = () => {
    closeSuccess();
    router.push("/settings");
  };

  return (
    <>
      <div
        className="mx-auto flex max-w-[800px] flex-col gap-8 rounded-xl border bg-white p-8"
        style={{
          borderColor: "#F2F4F7",
        }}
      >
        {step === "old" ? (
          <>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-2xl font-semibold leading-8 tracking-[-0.032em] text-[#323131]">
                Change Password
              </h2>
              <p className="text-lg font-normal leading-[26px] text-[#6C6969]">
                Enter your current password. We&apos;ll send an OTP to verify
                it&apos;s you before you set a new password.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-6">
              <MantinePasswordInput
                size="lg"
                label="Old Password *"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.currentTarget.value)}
                visibilityToggleIcon={({ reveal }) => (
                  <PasswordVisibilityIcon reveal={reveal} />
                )}
                classNames={inputClassNames}
              />
              <div className="flex flex-row flex-wrap items-start gap-6">
                <Button
                  component={Link}
                  href="/settings"
                  variant="default"
                  className="!h-[52px] !min-w-[188px] !rounded-full !border-[#CCCACA] !bg-white !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#4D4B4B] hover:!bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  className="!h-[52px] !min-w-[188px] !rounded-full !bg-primary-400 !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#FFF6F1] hover:!bg-primary-500 disabled:!opacity-20"
                  disabled={!isValid || requestOtpMutation.isPending}
                  loading={requestOtpMutation.isPending}
                  onClick={handleContinueFromOld}
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-2xl font-semibold leading-8 tracking-[-0.032em] text-[#323131]">
                Create a New Password
              </h2>
              <p className="text-lg font-normal leading-[26px] text-[#6C6969]">
                This password will be used every time you sign in. Make sure
                it&apos;s unique and secure for you.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-6">
              <div className="flex flex-col gap-6">
                <AuthPasswordInput
                  label="Create a New Password *"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password"
                  size="lg"
                />
                <ul className="space-y-1">
                  {[
                    {
                      text: "At least 8 characters",
                      met: passwordLengthOk(newPassword),
                    },
                    {
                      text: "Use both Uppercase letters (A-Z) and Lowercase letter (a-z).",
                      met: passwordUpperLowerOk(newPassword),
                    },
                    {
                      text: "Include Numbers (0-9)",
                      met: passwordNumberOk(newPassword),
                    },
                    {
                      text: "At least one symbol (e.g. ! ? @ # $ % ^ & * ( ) _ +)",
                      met: passwordSpecialOk(newPassword),
                    },
                  ].map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span
                        className={
                          req.met ? "text-success-500" : "text-text-300"
                        }
                      >
                        {req.met ? <Check size={18} /> : <Dot size={18} />}
                      </span>
                      <span
                        className={`text-sm ${
                          req.met ? "text-text-400" : "text-text-300"
                        }`}
                      >
                        {req.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <AuthPasswordInput
                  label="Confirm your New Password *"
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                  placeholder="Confirm new password"
                  size="lg"
                  error={
                    newPassword &&
                    confirmNewPassword &&
                    newPassword !== confirmNewPassword
                      ? "Passwords do not match"
                      : undefined
                  }
                />
              </div>
              <div className="flex flex-row flex-wrap items-start gap-6">
                <Button
                  variant="default"
                  className="!h-[52px] !min-w-[188px] !rounded-full !border-[#CCCACA] !bg-white !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#4D4B4B] hover:!bg-gray-50"
                  onClick={handleBackToOldStep}
                >
                  Back
                </Button>
                <Button
                  className="!h-[52px] !min-w-[188px] !rounded-full !bg-primary-400 !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#FFF6F1] hover:!bg-primary-500 disabled:!opacity-20"
                  disabled={!isValid || resetPasswordMutation.isPending}
                  loading={resetPasswordMutation.isPending}
                  onClick={handleCreateNew}
                >
                  Create New Password
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {email ? (
        <ChangePasswordOtpModal
          opened={otpModalOpened}
          onClose={closeOtpModal}
          onVerified={handleOtpVerified}
          email={email}
          oldPassword={oldPassword}
        />
      ) : null}

      <SuccessModal
        opened={successOpened}
        onClose={handleSuccessClose}
        title="Password Updated"
        message="Your password has been changed successfully."
        buttonText="Back to Settings"
        onButtonClick={handleSuccessClose}
      />
    </>
  );
}
