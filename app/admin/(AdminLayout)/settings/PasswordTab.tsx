"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../_components/Dialog";
import { PasswordInput } from "@mantine/core";
import { SuccessModal } from "../../_components/SuccessModal";
import { CustomButton } from "../../_components/CustomButton";

type PasswordStep = "change" | "create";

export default function PasswordTab() {
  const [step, setStep] = useState<PasswordStep>("change");

  const [oldPassword, setOldPassword] = useState("");
  const [confirmOldPassword, setConfirmOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmOldPassword, setShowConfirmOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [showValidatedModal, setShowValidatedModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  /* ---------------- Password Validation ---------------- */
  const hasLength = newPassword.length >= 8 && newPassword.length <= 12;
  const hasUpperAndLower =
    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%*&?]/.test(newPassword);

  const allValid = hasLength && hasUpperAndLower && hasNumber && hasSpecial;
  const passwordsMatch =
    newPassword === confirmNewPassword && confirmNewPassword.length > 0;

  /* ---------------- Handlers ---------------- */
  const handleChangePassword = () => {
    if (oldPassword && confirmOldPassword) {
      setShowValidatedModal(true);
    }
  };

  const handleCreateNewPassword = () => {
    if (allValid && passwordsMatch) {
      setShowSuccessModal(true);
    }
  };

  const resetAll = () => {
    setStep("change");
    setOldPassword("");
    setConfirmOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto w-full max-w-3xl bg-white mt-8 rounded-2xl p-8 shadow-sm">

      {/* ================= CHANGE PASSWORD ================= */}
      {step === "change" && (
        <div className="space-y-7">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
            <p className="text-sm text-gray-500">
              Change your password with ease
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <PassInput
              label="Old Password"
              placeholder="Enter Old password"
              value={oldPassword}
              onChange={setOldPassword}
              visible={showOldPassword}
              setVisible={setShowOldPassword}
            />
            <PassInput
              label="Confirm Old Password"
              placeholder="Enter password"
              value={confirmOldPassword}
              onChange={setConfirmOldPassword}
              visible={showConfirmOldPassword}
              setVisible={setShowConfirmOldPassword}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 justify-center">
            <CustomButton buttonType="secondary"
            fullWidth={true}
              onClick={() => setStep("change")}
              className="border-gray-300! text-gray-700! hover:bg-gray-50!"
            >
              Back
            </CustomButton>
            <CustomButton
              onClick={handleChangePassword}
              disabled={!oldPassword || !confirmOldPassword}
              buttonType="primary"
              fullWidth={true}
            >
              Change Password
            </CustomButton>
          </div>
        </div>
      )}

      {/* ================= CREATE NEW PASSWORD ================= */}
      {step === "create" && (
        <div className="space-y-7">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">
              Create a New Password
            </h2>
            <p className="text-sm text-gray-500">
              This password will be used every time you sign in. Make sure
              it&apos;s unique and secure for you.
            </p>
          </div>

          {/* New Password Field */}
          <div className="space-y-3">
            <PassInput
              label="Create a New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              setVisible={setShowNewPassword}
            />

            {/* Requirements — static bullet list */}
            <ul className="space-y-1 pl-1">
              <PasswordRule label="8–12 characters" />
              <PasswordRule label="Use both Uppercase letters (A-Z) and Lowercase letter (a-z)." />
              <PasswordRule label="Include Numbers (0–9)" />
              <PasswordRule label="Special characters (e.g. ! @ # $ % ^ & *)" />
            </ul>
          </div>

          {/* Confirm Password Field */}
          <PassInput
            label="Confirm your New Password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            visible={showConfirmNewPassword}
            setVisible={setShowConfirmNewPassword}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
           
            <CustomButton buttonType="secondary"
            fullWidth={true}
              onClick={() => setStep("change")}
              className="border-gray-300! text-gray-700! hover:bg-gray-50!"
            >
              Back
            </CustomButton>
            <CustomButton
              onClick={handleCreateNewPassword}
              disabled={!allValid || !passwordsMatch}
              buttonType="primary"
              fullWidth={true}
            >
              Change Password
            </CustomButton>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Old password validated → proceed to create */}
      <SuccessModal
        opened={showValidatedModal}
        onClose={() => {
          setShowValidatedModal(false);
          setStep("create");
        }}
        title="Old Password Validated"
        message="Your old password has been successfully validated."
        primaryButtonText="Create New Password"
      />

      {/* New password saved */}
      <SuccessModal
        opened={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          resetAll();
        }}
        title="Password Created"
        message="Your password has been successfully updated."
        secondaryButtonText="Close"
      />

      {/* Account deleted (kept for completeness) */}
      <Dialog open={showDeletedModal} onOpenChange={setShowDeletedModal}>
        <DialogContent className="text-center">
          <CircleCheck className="mx-auto h-12 w-12 text-green-600" />
          <DialogTitle>Account Deleted</DialogTitle>
          <DialogDescription>
            Your account has been permanently deleted.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function PassInput({
  label,
  placeholder,
  value,
  onChange,
  visible,
  setVisible,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}) {
  return (
    <PasswordInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      visible={visible}
      onVisibilityChange={setVisible}
      withAsterisk
      radius="md"
      size="md"
      styles={{
        label: { marginBottom: 6, fontWeight: 500, color: "#374151" },
        input: { borderColor: "#e5e7eb" },
      }}
    />
  );
}

function PasswordRule({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-500 list-none">
      <span className="mt-0.5 text-gray-400 select-none">·</span>
      <span>{label}</span>
    </li>
  );
}