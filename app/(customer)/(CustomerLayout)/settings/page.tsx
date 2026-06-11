"use client";

import { useState } from "react";
import { Button, Modal, PasswordInput } from "@mantine/core";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { useDisclosure } from "@mantine/hooks";
import FxTransactionTypeCard from "@/app/(customer)/_components/FxTransactionTypeCard";
import { User, KeyRound, Trash2, CircleAlert, Landmark } from "lucide-react";

const SETTINGS_OPTIONS_WITH_LINKS = [
  {
    icon: User,
    title: "Account Information",
    description: "Manage your personal details and account details",
    href: "/settings/account-information",
  },
  {
    icon: Landmark,
    title: "Bank Accounts",
    description: "Save and manage accounts for electronic transfer payouts",
    href: "/settings/bank-accounts",
  },
  {
    icon: KeyRound,
    title: "Change Password",
    description: "Update your login password to keep your account secure.",
    href: "/settings/change-password",
  },
] as const;

const DEACTIVATE_ACCOUNT_OPTION = {
  icon: Trash2,
  title: "Deactivate Account",
  description:
    "Temporarily suspend your account. Contact support if you need to reactivate.",
} as const;

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const [enterPasswordOpen, { open: openEnterPassword, close: closeEnterPassword }] =
    useDisclosure(false);
  const [successOpen, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);

  const openDeactivateAccountFlow = () => {
    openConfirm();
  };

  const handleConfirmYes = () => {
    closeConfirm();
    openEnterPassword();
  };

  const handleSubmitPassword = () => {
    if (!password.trim()) return;
    closeEnterPassword();
    setPassword("");
    openSuccess();
  };

  const handleCloseSuccess = () => {
    closeSuccess();
    window.location.href = "/";
  };
  const inputClassNames = {
    label: "text-sm font-medium leading-5 text-[#6C6969]",
    input:
      "!h-14 !rounded-lg !border-[#CCCACA] !px-3.5 !py-4 !text-base !leading-6 !text-[#1F1E1E] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] placeholder:!text-[#667085]",
  };

  return (
    <div className="space-y-8 rounded-2xl bg-white p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_OPTIONS_WITH_LINKS.map((opt, i) => (
          <FxTransactionTypeCard
            key={i}
            icon={<opt.icon className="size-6 text-primary-400" />}
            title={opt.title}
            description={opt.description}
            href={opt.href}
          />
        ))}
        <FxTransactionTypeCard
          icon={<DEACTIVATE_ACCOUNT_OPTION.icon className="size-6 text-primary-400" />}
          title={DEACTIVATE_ACCOUNT_OPTION.title}
          description={DEACTIVATE_ACCOUNT_OPTION.description}
          onClick={openDeactivateAccountFlow}
        />
      </div>

      {/* Deactivate Account */}
      <Modal
        opened={confirmOpen}
        onClose={closeConfirm}
        centered
        withCloseButton={false}
        size={400}
        classNames={{
          content:
            "rounded-xl! border border-[#D0D5DD] p-6 w-full max-w-[400px]!",
          body: "p-0!",
        }}
      >
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-25">
              <CircleAlert size={48} className="text-primary-400! " strokeWidth={2} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-xl font-semibold leading-7 text-[#131212]">
                Deactivate Account?
              </h3>
              <p className="text-base font-normal leading-6 text-[#6C6969]">
                Are you sure you want to deactivate your account? Your access
                will be suspended until your account is reactivated.
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-[352px] flex-col gap-4">
            <Button
              fullWidth
              className="h-[52px]! rounded-full! bg-primary-400! text-base font-medium leading-6 text-[#FFF6F1]! hover:bg-primary-500!"
              onClick={handleConfirmYes}
            >
              Yes, Deactivate Account
            </Button>
            <Button
              fullWidth
              variant="default"
              className="h-[52px]! rounded-full! border-text-50! bg-white! text-base font-medium leading-6 text-[#4D4B4B]! hover:bg-gray-50!"
              onClick={closeConfirm}
            >
              No, Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enter Password to Continue */}
      <Modal
        opened={enterPasswordOpen}
        onClose={closeEnterPassword}
        centered
        withCloseButton={false}
        size={400}
        classNames={{
          content:
            "rounded-xl! border border-[#D0D5DD] p-6 w-full max-w-[400px]!",
          body: "p-0!",
        }}
      >
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-25">
              <CircleAlert size={48} className="text-primary-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-xl font-semibold leading-7 text-[#131212]">
                Enter Password to Continue
              </h3>
              <p className="text-base font-normal leading-6 text-[#6C6969]">
                Enter your password to authorise account deactivation
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-[352px] flex-col gap-4">
            <PasswordInput
              label="Enter Password *"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              classNames={inputClassNames}
            />
            <Button
              fullWidth
              className="h-[52px]! rounded-full! bg-primary-400! text-base font-medium leading-6 text-[#FFF6F1]! hover:bg-primary-500! disabled:opacity-50!"
              disabled={!password.trim()}
              onClick={handleSubmitPassword}
            >
              Yes, Deactivate Account
            </Button>
            <Button
              fullWidth
              variant="default"
              className="h-[52px]! rounded-full! border-text-50! bg-white! text-base font-medium leading-6 text-[#4D4B4B]! hover:bg-gray-50!"
              onClick={closeEnterPassword}
            >
              No, Close
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        opened={successOpen}
        onClose={closeSuccess}
        title="Account Deactivated"
        message="Your account has been successfully deactivated."
        buttonText="Close"
        buttonVariant="outline"
        onButtonClick={handleCloseSuccess}
      />
    </div>
  );
}
