"use client";

import { Button, TextInput } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { UserTypeCard } from "@/app/(customer)/_components/auth/UserTypeCard";
import TransactionFileUploadInput from "@/app/(customer)/_components/forms/TransactionFileUploadInput";
import { emailIcon, phoneIcon } from "@/app/assets/asset";
import type {
  AgentCustomerType,
  OtpDeliveryMethod,
} from "@/app/agent/(AgentLayout)/transactions/_components/useAgentAddCustomerFlow";

interface BackButtonProps {
  onBack: () => void;
}

function BackButton({ onBack }: Readonly<BackButtonProps>) {
  return (
    <Button
      type="button"
      variant="subtle"
      leftSection={<ArrowLeft size={18} />}
      onClick={onBack}
      className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
    >
      Back
    </Button>
  );
}

interface CustomerTypeStepProps {
  selectedType: AgentCustomerType | null;
  onSelectType: (type: AgentCustomerType) => void;
  onContinue: () => void;
}

export function CustomerTypeStep({
  selectedType,
  onSelectType,
  onContinue,
}: Readonly<CustomerTypeStepProps>) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Kindly select the type of customer you are trying to onboard.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CustomerTypeOption
          label="Resident"
          selected={selectedType === "resident"}
          onClick={() => onSelectType("resident")}
        />
        <CustomerTypeOption
          label="Tourist"
          selected={selectedType === "tourist"}
          onClick={() => onSelectType("tourist")}
        />
        <CustomerTypeOption
          label="Expatriate"
          selected={selectedType === "expatriate"}
          onClick={() => onSelectType("expatriate")}
        />
      </div>

      <Button
        onClick={onContinue}
        disabled={!selectedType}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={<ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1]"
      >
        Continue
      </Button>
    </div>
  );
}

interface CustomerTypeOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function CustomerTypeOption({
  label,
  selected,
  onClick,
}: Readonly<CustomerTypeOptionProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium ${
        selected
          ? "border-primary-500 bg-[#FFF6F1] text-[#4D4B4B]"
          : "border-[#E1E0E0] bg-white text-[#4D4B4B]"
      }`}
    >
      {label}
    </button>
  );
}

interface ResidentBvnStepProps {
  bvn: string;
  isSubmitting: boolean;
  onBvnChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ResidentBvnStep({
  bvn,
  isSubmitting,
  onBvnChange,
  onContinue,
  onBack,
}: Readonly<ResidentBvnStepProps>) {
  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Kindly input the BVN of the customer you are trying to onboard.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="agent-customer-bvn" className="block text-heading-200 text-sm font-medium">
          Enter BVN <span className="text-error-500">*</span>
        </label>
        <TextInput
          id="agent-customer-bvn"
          value={bvn}
          onChange={(e) =>
            onBvnChange(e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 11))
          }
          placeholder="22234455555"
          size="lg"
        />
      </div>

      <Button
        onClick={onContinue}
        disabled={bvn.length !== 11 || isSubmitting}
        loading={isSubmitting}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={!isSubmitting && <ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Verifying..." : "Continue"}
      </Button>
    </div>
  );
}

interface OtpDeliveryStepProps {
  selectedOtpMethod: OtpDeliveryMethod | null;
  isSendingOtp: boolean;
  onSelectOtpMethod: (method: OtpDeliveryMethod) => void;
  onContinue: (method: OtpDeliveryMethod) => void;
  onBack: () => void;
}

export function OtpDeliveryStep({
  selectedOtpMethod,
  isSendingOtp,
  onSelectOtpMethod,
  onContinue,
  onBack,
}: Readonly<OtpDeliveryStepProps>) {
  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">Send OTP</h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Choose where to send the OTP for this customer&apos;s verification.
        </p>
      </div>
      <div className="space-y-4 border border-[#F2F4F7] rounded-xl p-4">
        <UserTypeCard
          icon={phoneIcon}
          title="Send to customer's phone number"
          isSelected={selectedOtpMethod === "phone"}
          onClick={() => onSelectOtpMethod("phone")}
        />
        <UserTypeCard
          icon={emailIcon}
          title="Send to customer's email"
          isSelected={selectedOtpMethod === "email"}
          onClick={() => onSelectOtpMethod("email")}
        />
      </div>
      <Button
        onClick={() => selectedOtpMethod && onContinue(selectedOtpMethod)}
        disabled={!selectedOtpMethod || isSendingOtp}
        loading={isSendingOtp}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={!isSendingOtp && <ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        {isSendingOtp ? "Sending..." : "Continue"}
      </Button>
    </div>
  );
}

interface PassportDetailsStepProps {
  passportNumber: string;
  passportFile: FileWithPath | null;
  isSubmitting: boolean;
  onPassportNumberChange: (value: string) => void;
  onPassportFileChange: (file: FileWithPath | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PassportDetailsStep({
  passportNumber,
  passportFile,
  isSubmitting,
  onPassportNumberChange,
  onPassportFileChange,
  onContinue,
  onBack,
}: Readonly<PassportDetailsStepProps>) {
  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Kindly input the customer&apos;s international passport number and upload
          the passport document for verification.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="agent-customer-passport-number"
          className="block text-heading-200 text-sm font-medium"
        >
          International Passport Number <span className="text-error-500">*</span>
        </label>
        <TextInput
          id="agent-customer-passport-number"
          value={passportNumber}
          onChange={(e) =>
            onPassportNumberChange(
              e.currentTarget.value.toUpperCase().replaceAll(/[^A-Z0-9]/g, "").slice(0, 9)
            )
          }
          placeholder="A12345678"
          size="lg"
          maxLength={9}
        />
      </div>

      <TransactionFileUploadInput
        label="International Passport"
        required
        value={passportFile}
        onChange={onPassportFileChange}
      />

      <Button
        onClick={onContinue}
        disabled={!passportNumber.trim() || !passportFile || isSubmitting}
        loading={isSubmitting}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={!isSubmitting && <ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Verifying..." : "Continue"}
      </Button>
    </div>
  );
}

interface VerifyOtpStepProps {
  selectedType: AgentCustomerType | null;
  otpDeliveryMethod: OtpDeliveryMethod | null;
  isOtpComplete: boolean;
  isSubmitting: boolean;
  isResendingOtp: boolean;
  onOtpComplete: (value: string) => void;
  onResendOtp: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function VerifyOtpStep({
  selectedType,
  otpDeliveryMethod,
  isOtpComplete,
  isSubmitting,
  isResendingOtp,
  onOtpComplete,
  onResendOtp,
  onContinue,
  onBack,
}: Readonly<VerifyOtpStepProps>) {
  let maskedInfo =
    "A six (6) digit OTP has been sent to the phone number or email linked to this passport. Enter to verify.";

  if (selectedType === "resident" && otpDeliveryMethod) {
    const destination = otpDeliveryMethod === "phone" ? "phone number" : "email";
    maskedInfo = `A six (6) digit OTP has been sent to the customer's ${destination} linked to this BVN. Enter to verify.`;
  } else if (selectedType === "resident") {
    maskedInfo = "A six (6) digit OTP has been sent. Enter to verify.";
  }

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Verify {selectedType === "resident" ? "BVN" : "Passport"}
        </h2>
        <OTPInput
          onComplete={onOtpComplete}
          maskedInfo={maskedInfo}
          expiryMinutes={5}
          onResend={onResendOtp}
          isResending={isResendingOtp}
        />
      </div>

      <Button
        onClick={onContinue}
        disabled={!isOtpComplete || isSubmitting}
        loading={isSubmitting}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={!isSubmitting && <ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Verifying..." : "Continue"}
      </Button>
    </div>
  );
}
