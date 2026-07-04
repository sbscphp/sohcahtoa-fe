"use client";

import { Button, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { FileWithPath } from "@mantine/dropzone";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { UserTypeCard } from "@/app/(customer)/_components/auth/UserTypeCard";
import TransactionFileUploadInput from "@/app/(customer)/_components/forms/TransactionFileUploadInput";
import { formatDateToIso } from "@/app/(customer)/_utils/input-validation";
import { emailIcon, phoneIcon } from "@/app/assets/asset";
import type {
  AgentCustomerType,
  OtpDeliveryMethod,
} from "@/app/agent/(AgentLayout)/transactions/_components/useAgentAddCustomerFlow";
import {
  isValidEmail,
  isValidNigerianPhoneNumber,
  normalizeNigerianPhoneInput,
} from "@/app/_lib/nibss-bvn-consent/phone-validation";

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
  email: string;
  phoneNumber: string;
  isSubmitting: boolean;
  onBvnChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ResidentBvnStep({
  bvn,
  email,
  phoneNumber,
  isSubmitting,
  onBvnChange,
  onEmailChange,
  onPhoneNumberChange,
  onContinue,
  onBack,
}: Readonly<ResidentBvnStepProps>) {
  const isFormValid =
    bvn.length === 11 &&
    isValidEmail(email) &&
    isValidNigerianPhoneNumber(normalizeNigerianPhoneInput(phoneNumber));

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Enter the customer&apos;s BVN and contact details. They will complete
          NIBSS consent before OTP verification.
        </p>
      </div>

      <div className="space-y-4">
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

        <div className="space-y-2">
          <label htmlFor="agent-customer-email" className="block text-heading-200 text-sm font-medium">
            Email address <span className="text-error-500">*</span>
          </label>
          <TextInput
            id="agent-customer-email"
            value={email}
            onChange={(e) => onEmailChange(e.currentTarget.value)}
            placeholder="customer@email.com"
            size="lg"
            type="email"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="agent-customer-phone" className="block text-heading-200 text-sm font-medium">
            Phone number <span className="text-error-500">*</span>
          </label>
          <TextInput
            id="agent-customer-phone"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.currentTarget.value)}
            placeholder="+2348031234567"
            size="lg"
            type="tel"
            maxLength={14}
            autoComplete="tel"
          />
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={!isFormValid || isSubmitting}
        loading={isSubmitting}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={!isSubmitting && <ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Starting consent…" : "Continue to NIBSS consent"}
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

interface ExpatriateDetailsStepProps {
  bvn: string;
  passportNumber: string;
  passportFile: FileWithPath | null;
  isSubmitting: boolean;
  onBvnChange: (value: string) => void;
  onPassportNumberChange: (value: string) => void;
  onPassportFileChange: (file: FileWithPath | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ExpatriateDetailsStep({
  bvn,
  passportNumber,
  passportFile,
  isSubmitting,
  onBvnChange,
  onPassportNumberChange,
  onPassportFileChange,
  onContinue,
  onBack,
}: Readonly<ExpatriateDetailsStepProps>) {
  const canContinue =
    bvn.length === 11 && passportNumber.trim().length > 0 && passportFile != null;

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Enter the expatriate customer&apos;s BVN, international passport number,
          and upload their passport document.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="agent-expatriate-bvn" className="block text-heading-200 text-sm font-medium">
          BVN <span className="text-error-500">*</span>
        </label>
        <TextInput
          id="agent-expatriate-bvn"
          value={bvn}
          onChange={(e) =>
            onBvnChange(e.currentTarget.value.replaceAll(/\D/g, "").slice(0, 11))
          }
          placeholder="22234455555"
          size="lg"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="agent-expatriate-passport-number"
          className="block text-heading-200 text-sm font-medium"
        >
          International Passport Number <span className="text-error-500">*</span>
        </label>
        <TextInput
          id="agent-expatriate-passport-number"
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
        disabled={!canContinue || isSubmitting}
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

interface TouristDetailsStepProps {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  passportFile: FileWithPath | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onPassportNumberChange: (value: string) => void;
  onPassportFileChange: (file: FileWithPath | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function TouristDetailsStep({
  email,
  firstName,
  lastName,
  dateOfBirth,
  passportNumber,
  passportFile,
  isSubmitting,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
  onDateOfBirthChange,
  onPassportNumberChange,
  onPassportFileChange,
  onContinue,
  onBack,
}: Readonly<TouristDetailsStepProps>) {
  const canContinue =
    email.trim().length > 0 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    dateOfBirth.trim().length > 0 &&
    passportNumber.trim().length > 0 &&
    passportFile != null;

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Enter the tourist customer&apos;s details. An OTP will be sent to their
          email address for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="agent-tourist-first-name" className="block text-heading-200 text-sm font-medium">
            First Name <span className="text-error-500">*</span>
          </label>
          <TextInput
            id="agent-tourist-first-name"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.currentTarget.value)}
            placeholder="First name"
            size="lg"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="agent-tourist-last-name" className="block text-heading-200 text-sm font-medium">
            Last Name <span className="text-error-500">*</span>
          </label>
          <TextInput
            id="agent-tourist-last-name"
            value={lastName}
            onChange={(e) => onLastNameChange(e.currentTarget.value)}
            placeholder="Last name"
            size="lg"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="agent-tourist-email" className="block text-heading-200 text-sm font-medium">
          Email Address <span className="text-error-500">*</span>
        </label>
        <TextInput
          id="agent-tourist-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.currentTarget.value)}
          placeholder="customer@email.com"
          size="lg"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="agent-tourist-dob" className="block text-heading-200 text-sm font-medium">
          Date of Birth <span className="text-error-500">*</span>
        </label>
        <DateInput
          id="agent-tourist-dob"
          placeholder="Select date of birth"
          value={dateOfBirth.trim() ? new Date(dateOfBirth) : null}
          onChange={(value) => onDateOfBirthChange(formatDateToIso(value))}
          maxDate={new Date()}
          size="lg"
          rightSection={<HugeiconsIcon icon={CalendarIcon} size={20} className="text-text-300!" />}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="agent-tourist-passport-number"
          className="block text-heading-200 text-sm font-medium"
        >
          Passport Number <span className="text-error-500">*</span>
        </label>
        <TextInput
          id="agent-tourist-passport-number"
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
        disabled={!canContinue || isSubmitting}
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
    "A six (6) digit OTP has been sent. Enter to verify.";

  if (selectedType === "resident" && otpDeliveryMethod) {
    const destination = otpDeliveryMethod === "phone" ? "phone number" : "email";
    maskedInfo = `A six (6) digit OTP has been sent to the customer's ${destination} linked to this BVN. Enter to verify.`;
  } else if (selectedType === "expatriate" && otpDeliveryMethod) {
    const destination = otpDeliveryMethod === "phone" ? "phone number" : "email";
    maskedInfo = `A six (6) digit OTP has been sent to the customer's ${destination}. Enter to verify.`;
  } else if (selectedType === "tourist") {
    maskedInfo =
      "A six (6) digit OTP has been sent to the customer's email address. Enter to verify.";
  }

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Verify{" "}
          {selectedType === "resident"
            ? "BVN"
            : selectedType === "tourist"
              ? "Email"
              : "Details"}
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
