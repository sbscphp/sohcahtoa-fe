"use client";

import { useState } from "react";
import { Modal, Button, TextInput } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { UserTypeCard } from "@/app/(customer)/_components/auth/UserTypeCard";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { emailIcon, phoneIcon } from "@/app/assets/asset";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { handleApiError } from "@/app/_lib/api/error-handler";

type AgentCustomerType = "resident" | "tourist-expatriate";

interface AgentAddCustomerModalProps {
  opened: boolean;
  onClose: () => void;
}

type Step =
  | "type-select"
  | "resident-bvn"
  | "otp-delivery"
  | "tourist-passport"
  | "verify-otp"
  | "success";

export function AgentAddCustomerModal({
  opened,
  onClose,
}: AgentAddCustomerModalProps) {
  const [step, setStep] = useState<Step>("type-select");
  const [selectedType, setSelectedType] = useState<AgentCustomerType | null>(null);
  const [bvn, setBvn] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpDeliveryMethod, setOtpDeliveryMethod] = useState<"phone" | "email" | null>(null);
  const [selectedOtpMethod, setSelectedOtpMethod] = useState<"phone" | "email" | null>(null);

  const verifyBvnMutation = useCreateData(agentApi.customerAuth.nigerian.verifyBvn);
  const sendOtpMutation = useCreateData(agentApi.customerAuth.nigerian.sendOtp);
  const resendOtpMutation = useCreateData(agentApi.customerAuth.nigerian.resendOtp);
  const validateOtpMutation = useCreateData(agentApi.customerAuth.nigerian.validateOtp);
  const createAccountMutation = useCreateData(agentApi.customerAuth.nigerian.createAccount);

  const resetState = () => {
    setStep("type-select");
    setSelectedType(null);
    setBvn("");
    setPassportNumber("");
    setOtp("");
    setIsOtpComplete(false);
    setIsSubmitting(false);
    setVerificationToken(null);
    setOtpDeliveryMethod(null);
    setSelectedOtpMethod(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleTypeContinue = () => {
    if (selectedType === "resident") {
      setStep("resident-bvn");
    } else if (selectedType === "tourist-expatriate") {
      setStep("tourist-passport");
    }
  };

  const handleResidentBvnContinue = () => {
    if (bvn.length !== 11) return;
    setIsSubmitting(true);
    verifyBvnMutation.mutate(
      { bvn },
      {
        onSuccess: (response) => {
          if (response.success && response.data?.verificationToken) {
            setVerificationToken(response.data.verificationToken);
            setIsSubmitting(false);
            setStep("otp-delivery");
          } else {
            setIsSubmitting(false);
            handleApiError(
              { message: response.error?.message ?? "BVN verification failed", status: 400 },
              { customMessage: response.error?.message ?? "BVN verification failed. Please check and try again." }
            );
          }
        },
        onError: (error) => {
          setIsSubmitting(false);
          handleApiError(error, { customMessage: "Failed to verify BVN. Please try again." });
        },
      }
    );
  };

  const handleOtpDeliveryContinue = (method: "phone" | "email") => {
    if (!verificationToken) {
      handleApiError(
        { message: "Missing verification token", status: 400 },
        { customMessage: "Please complete BVN verification first." }
      );
      return;
    }
    setOtpDeliveryMethod(method);
    setSelectedOtpMethod(method);
    sendOtpMutation.mutate(
      { verificationToken, verificationType: method },
      {
        onSuccess: (response) => {
          if (response.success) {
            setOtp("");
            setIsOtpComplete(false);
            setStep("verify-otp");
          } else {
            handleApiError(
              { message: response.error?.message ?? "Failed to send OTP", status: 400 },
              { customMessage: response.error?.message ?? "Failed to send OTP. Please try again." }
            );
          }
        },
        onError: (error) => {
          handleApiError(error, { customMessage: "Failed to send OTP. Please try again." });
        },
      }
    );
  };

  const handleTouristPassportContinue = () => {
    if (passportNumber.trim().length > 0) {
      setStep("verify-otp");
      setOtp("");
      setIsOtpComplete(false);
    }
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    setIsOtpComplete(true);
  };

  const handleResendOtp = () => {
    if (!verificationToken || !otpDeliveryMethod) return;
    setOtp("");
    setIsOtpComplete(false);
    resendOtpMutation.mutate(
      { verificationToken, verificationType: otpDeliveryMethod },
      {
        onSuccess: (response) => {
          if (!response.success) {
            handleApiError(
              { message: response.error?.message ?? "Failed to resend OTP", status: 400 },
              { customMessage: response.error?.message ?? "Failed to resend OTP. Please try again." }
            );
          }
        },
        onError: (error) => {
          handleApiError(error, { customMessage: "Failed to resend OTP. Please try again." });
        },
      }
    );
  };

  const handleVerifyContinue = () => {
    if (!isOtpComplete || !selectedType || !verificationToken) return;
    const customerType =
      selectedType === "resident" ? "NIGERIAN_CITIZEN" : "EXPATRIATE";
    setIsSubmitting(true);
    validateOtpMutation.mutate(
      { verificationToken, otp },
      {
        onSuccess: (validateRes) => {
          if (!validateRes.success || !validateRes.data) {
            setIsSubmitting(false);
            handleApiError(
              { message: validateRes.error?.message ?? "OTP validation failed", status: 400 },
              { customMessage: validateRes.error?.message ?? "Invalid OTP. Please check and try again." }
            );
            return;
          }
          const tokenForCreate = validateRes.data.validationToken ?? verificationToken;
          createAccountMutation.mutate(
            {
              verificationToken: tokenForCreate,
              password: "securePass12!",
              customerType,
            },
            {
              onSuccess: (createRes) => {
                setIsSubmitting(false);
                const createdData = createRes.data as { userId?: string } | undefined;
                if (createRes.success && createdData?.userId) {
                  setStep("success");
                } else {
                  handleApiError(
                    { message: createRes.error?.message ?? "Account creation failed", status: 400 },
                    { customMessage: createRes.error?.message ?? "Failed to create customer account. Please try again." }
                  );
                }
              },
              onError: (error) => {
                setIsSubmitting(false);
                handleApiError(error, { customMessage: "Failed to create customer account. Please try again." });
              },
            }
          );
        },
        onError: (error) => {
          setIsSubmitting(false);
          handleApiError(error, { customMessage: "Failed to validate OTP. Please try again." });
        },
      }
    );
  };

  const renderTypeSelect = () => (
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
        <button
          type="button"
          onClick={() => setSelectedType("resident")}
          className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium ${
            selectedType === "resident"
              ? "border-primary-500 bg-[#FFF6F1] text-[#4D4B4B]"
              : "border-[#E1E0E0] bg-white text-[#4D4B4B]"
          }`}
        >
          Resident
        </button>
        <button
          type="button"
          onClick={() => setSelectedType("tourist-expatriate")}
          className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium ${
            selectedType === "tourist-expatriate"
              ? "border-primary-500 bg-[#FFF6F1] text-[#4D4B4B]"
              : "border-[#E1E0E0] bg-white text-[#4D4B4B]"
          }`}
        >
          Tourist / Expatriate
        </button>
      </div>

      <Button
        onClick={handleTypeContinue}
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

  const renderResidentBvn = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Kindly input the BVN of the customer you are trying to onboard.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-heading-200 text-sm font-medium">
          Enter BVN <span className="text-error-500">*</span>
        </label>
        <TextInput
          value={bvn}
          onChange={(e) =>
            setBvn(e.currentTarget.value.replace(/\D/g, "").slice(0, 11))
          }
          placeholder="22234455555"
          size="lg"
        />
      </div>

      <Button
        onClick={handleResidentBvnContinue}
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

  const renderOtpDelivery = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">Send OTP</h2>
        <p className="text-body-text-200 text-sm md:text-base">
          We need to verify the customer&apos;s BVN. Choose where to send the OTP.
        </p>
      </div>
      <div className="space-y-4 border border-[#F2F4F7] rounded-xl p-4">
        <UserTypeCard
          icon={phoneIcon}
          title="Send to customer's phone number"
          isSelected={selectedOtpMethod === "phone"}
          onClick={() => setSelectedOtpMethod("phone")}
        />
        <UserTypeCard
          icon={emailIcon}
          title="Send to customer's email"
          isSelected={selectedOtpMethod === "email"}
          onClick={() => setSelectedOtpMethod("email")}
        />
      </div>
      <Button
        onClick={() => selectedOtpMethod && handleOtpDeliveryContinue(selectedOtpMethod)}
        disabled={!selectedOtpMethod || sendOtpMutation.isPending}
        loading={sendOtpMutation.isPending}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={!sendOtpMutation.isPending && <ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        {sendOtpMutation.isPending ? "Sending..." : "Continue"}
      </Button>
    </div>
  );

  const renderTouristPassport = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Add New Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Kindly input the International Passport Number of the customer you are
          trying to onboard.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-heading-200 text-sm font-medium">
          International Passport Number <span className="text-error-500">*</span>
        </label>
        <TextInput
          value={passportNumber}
          onChange={(e) => setPassportNumber(e.currentTarget.value)}
          placeholder="A12345678"
          size="lg"
        />
      </div>

      <Button
        onClick={handleTouristPassportContinue}
        disabled={!passportNumber.trim()}
        fullWidth
        radius="xl"
        size="lg"
        rightSection={<ArrowUpRight size={18} />}
        className="bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
      >
        Continue
      </Button>
    </div>
  );

  const renderVerifyOtp = () => {
    const maskedInfo =
      selectedType === "resident" && otpDeliveryMethod
        ? `A six (6) digit OTP has been sent to the customer's ${otpDeliveryMethod === "phone" ? "phone number" : "email"} linked to this BVN. Enter to verify.`
        : selectedType === "resident"
          ? "A six (6) digit OTP has been sent. Enter to verify."
          : "A six (6) digit OTP has been sent to the phone number or email linked to this passport. Enter to verify.";

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-body-heading-300 text-2xl font-semibold">
            Verify {selectedType === "resident" ? "BVN" : "Passport"}
          </h2>
          <OTPInput
            onComplete={handleOtpComplete}
            maskedInfo={maskedInfo}
            expiryMinutes={5}
            onResend={selectedType === "resident" ? handleResendOtp : undefined}
            isResending={selectedType === "resident" ? sendOtpMutation.isPending : false}
          />
        </div>

        <Button
          onClick={handleVerifyContinue}
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
  };

  const renderBody = () => {
    switch (step) {
      case "type-select":
        return renderTypeSelect();
      case "resident-bvn":
        return renderResidentBvn();
      case "otp-delivery":
        return renderOtpDelivery();
      case "tourist-passport":
        return renderTouristPassport();
      case "verify-otp":
        return renderVerifyOtp();
      case "success":
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        opened={opened && step !== "success"}
        onClose={handleClose}
        centered
        radius="xl"
        size="577px"
        closeOnClickOutside={false}
        // withCloseButton={step !== "otp-delivery" && step !== "verify-otp"}
      >
        <div className="p-4 md:p-6">{renderBody()}</div>
      </Modal>

      <SuccessModal
        opened={opened && step === "success"}
        onClose={handleClose}
        title="Customer Added Successfully"
        message="The customer has been verified and added successfully. Continue below to begin the transaction."
        buttonText="Continue"
        onButtonClick={handleClose}
      />
    </>
  );
}

