"use client";

import { useState } from "react";
import { Check, X, CircleCheck } from "lucide-react";

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../_components/Dialog";
import { Button, PasswordInput } from "@mantine/core";
import { SuccessModal } from "../../_components/SuccessModal";

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

  //   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  //   const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false)
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  //   const [showDeletePasswordField, setShowDeletePasswordField] = useState(false)

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
    setDeletePassword("");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mx-auto w-full max-w-xl py-8 bg-white p-5 rounded-lg">
      {/* ================= CHANGE PASSWORD ================= */}
      {step === "change" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              Change your password with ease
            </p>
          </div>

          <div className="space-y-4">
            {/* Old Password */}
            <PassInput
              label="Old Password"
              value={oldPassword}
              onChange={setOldPassword}
              visible={showOldPassword}
              setVisible={setShowOldPassword}
            />

            {/* Confirm Old Password */}
            <PassInput
              label="Confirm Old Password"
              value={confirmOldPassword}
              onChange={setConfirmOldPassword}
              visible={showConfirmOldPassword}
              setVisible={setShowConfirmOldPassword}
            />
          </div>

          <div className="flex justify-center mx-auto gap-3 max-w-87.5">
            <Button variant="outline" className="rounded-full! w-full!">
              Back
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!oldPassword || !confirmOldPassword}
              className="rounded-full! w-full!"
            >
              Change Password
            </Button>
          </div>
        </div>
      )}

      {/* ================= CREATE PASSWORD ================= */}
      {step === "create" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Create a New Password</h2>
            <p className="text-sm text-muted-foreground">
              Make sure it’s strong and secure
            </p>
          </div>

          <PassInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            setVisible={setShowNewPassword}
          />

          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <PassRequirement met={hasLength} label="8–12 characters" />
            <PassRequirement
              met={hasUpperAndLower}
              label="Upper & lowercase letters"
            />
            <PassRequirement met={hasNumber} label="Include numbers" />
            <PassRequirement met={hasSpecial} label="Special characters" />
          </div>

          <PassInput
            label="Confirm New Password"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            visible={showConfirmNewPassword}
            setVisible={setShowConfirmNewPassword}
          />

          <div className="flex justify-center mx-auto gap-3 max-w-87.5">
            <Button
              variant="outline"
              onClick={() => setStep("change")}
              className="rounded-full! w-full!"
            >
              Back
            </Button>
            <Button
              onClick={handleCreateNewPassword}
              disabled={!allValid || !passwordsMatch}
              className="rounded-full! w-full! bg-[#E8533F]"
            >
              Create New Password
            </Button>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}
      
      <SuccessModal
        opened={showValidatedModal}
        onClose={() => {
              setShowValidatedModal(false);
              setStep("create");
            }}
        title={`Old PassWord Validated`}
        message={`Your old password has been successfully validated.`}
        primaryButtonText="Create New Password"
        // secondaryButtonText="No, Close"
      />

       <SuccessModal
        opened={showSuccessModal}
        onClose={() => {
              setShowSuccessModal(false);
              resetAll();
            }}
        title={`Password Created`}
        message={`Your password has been successfully updated`}
        // primaryButtonText="Create New Password"
        secondaryButtonText="Close"
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="text-center">
          <CircleCheck className="mx-auto h-12 w-12 text-green-600" />
          <DialogTitle>New Password Created</DialogTitle>
          <DialogDescription>
            New Password has been successfully Created
          </DialogDescription>
          <Button
            variant="outline"
            onClick={() => {
              setShowSuccessModal(false);
              resetAll();
            }}
            className="mt-4 w-full rounded-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeletedModal} onOpenChange={setShowDeletedModal}>
        <DialogContent className="text-center">
          <CircleCheck className="mx-auto h-12 w-12 text-green-600" />
          <DialogTitle>Account Deleted</DialogTitle>
          <DialogDescription>
            Your account has been permanently deleted
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function PassInput({
  label,
  value,
  onChange,
  visible,
  setVisible,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <PasswordInput
          label={label}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          visible={visible}
          onVisibilityChange={setVisible}
          placeholder={label}
          withAsterisk
          radius="md"
          size="md"
        />
      </div>
    </div>
  );
}

function PassRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="text-green-600" size={14} />
      ) : (
        <X className="text-muted-foreground" size={14} />
      )}
      <span className={met ? "text-green-700" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
