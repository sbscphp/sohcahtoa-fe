"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordInput as MantinePasswordInput, Button } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { Check, Dot } from "lucide-react";
import { PasswordInput as AuthPasswordInput } from "@/app/(customer)/_components/auth/PasswordInput";

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

function validateNewPassword(pwd: string) {
  const hasLength = pwd.length >= 8 && pwd.length <= 12;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*]/.test(pwd);
  return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

export default function ChangePasswordPage() {
  const [step, setStep] = useState<Step>("old");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmOldPassword, setConfirmOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleValidateOld = () => {
    // TODO: API validate old password then move to step "new"
    setStep("new");
  };

  const handleCreateNew = () => {
    // TODO: API submit new password
  };

  const newPasswordValid =
    newPassword.length > 0 &&
    validateNewPassword(newPassword) &&
    newPassword === confirmNewPassword;
  const isValid =
    step === "old"
      ? oldPassword.length > 0 && oldPassword === confirmOldPassword
      : newPasswordValid;

  const inputClassNames = {
    label: "text-sm font-medium leading-5 text-[#6C6969]",
    input:
      "!h-14 !rounded-lg !border-[#CCCACA] !px-3.5 !py-4 !text-base !leading-6 !text-[#1F1E1E] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] placeholder:!text-[#667085]",
  };

  return (
    <div
      className="flex flex-col gap-8 rounded-xl border bg-white p-8 max-w-[800px] mx-auto"
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
              Change your password with ease
            </p>
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-6">
              <MantinePasswordInput
                size="lg"
                label="Old Password *"
                placeholder="Enter Old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.currentTarget.value)}
                visibilityToggleIcon={({ reveal }) => <PasswordVisibilityIcon reveal={reveal} />}
                classNames={inputClassNames}
              />
              <MantinePasswordInput
                size="lg"
                label="Confirm Old Password *"
                placeholder="Enter password"
                value={confirmOldPassword}
                onChange={(e) => setConfirmOldPassword(e.currentTarget.value)}
                visibilityToggleIcon={({ reveal }) => <PasswordVisibilityIcon reveal={reveal} />}
                classNames={inputClassNames}
              />
            </div>
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
                disabled={!isValid}
                onClick={handleValidateOld}
              >
                Change Password
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
                    text: "8-12 characters",
                    met: newPassword.length >= 8 && newPassword.length <= 12,
                  },
                  {
                    text: "Use both Uppercase letters (A-Z) and Lowercase letter (a-z).",
                    met: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
                  },
                  {
                    text: "Include Numbers (0-9)",
                    met: /[0-9]/.test(newPassword),
                  },
                  {
                    text: "Special characters (e.g. ! @ # $ % ^ & *)",
                    met: /[!@#$%^&*]/.test(newPassword),
                  },
                ].map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className={
                        req.met ? "text-success-500" : "text-text-300"
                      }
                    >
                      {req.met ? (
                        <Check size={18} />
                      ) : (
                        <Dot size={18} />
                      )}
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
                  newPassword && confirmNewPassword && newPassword !== confirmNewPassword
                    ? "Passwords do not match"
                    : undefined
                }
              />
            </div>
            <div className="flex flex-row flex-wrap items-start gap-6">
              <Button
                variant="default"
                className="!h-[52px] !min-w-[188px] !rounded-full !border-[#CCCACA] !bg-white !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#4D4B4B] hover:!bg-gray-50"
                onClick={() => setStep("old")}
              >
                Back
              </Button>
              <Button
                className="!h-[52px] !min-w-[188px] !rounded-full !bg-primary-400 !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#FFF6F1] hover:!bg-primary-500 disabled:!opacity-20"
                disabled={!isValid}
                onClick={handleCreateNew}
              >
                Create New Password
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
