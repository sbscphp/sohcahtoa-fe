"use client";

import { useState } from "react";
import type { FileWithPath } from "@mantine/dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { PASSPORT_NUMBER_REGEX } from "@/app/(customer)/_utils/input-validation";

export type AgentCustomerType = "resident" | "tourist" | "expatriate";
export type AgentAddCustomerStep =
  | "type-select"
  | "resident-bvn"
  | "otp-delivery"
  | "passport-details"
  | "verify-otp"
  | "success";

export type OtpDeliveryMethod = "phone" | "email";

const DEFAULT_AGENT_CUSTOMER_PASSWORD = "securePass12!"; // NOSONAR: backend requires a password for agent-created customers.

export function useAgentAddCustomerFlow() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AgentAddCustomerStep>("type-select");
  const [selectedType, setSelectedType] = useState<AgentCustomerType | null>(null);
  const [bvn, setBvn] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportFile, setPassportFile] = useState<FileWithPath | null>(null);
  const [otp, setOtp] = useState("");
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpDeliveryMethod, setOtpDeliveryMethod] = useState<OtpDeliveryMethod | null>(null);
  const [selectedOtpMethod, setSelectedOtpMethod] = useState<OtpDeliveryMethod | null>(null);

  const verifyBvnMutation = useCreateData(agentApi.customerAuth.nigerian.verifyBvn);
  const sendOtpMutation = useCreateData(agentApi.customerAuth.nigerian.sendOtp);
  const resendOtpMutation = useCreateData(agentApi.customerAuth.nigerian.resendOtp);
  const validateOtpMutation = useCreateData(agentApi.customerAuth.nigerian.validateOtp);
  const createAccountMutation = useCreateData(agentApi.customerAuth.nigerian.createAccount);
  const uploadPassportMutation = useCreateData(agentApi.customerAuth.passport.upload);
  const verifyTouristPassportMutation = useCreateData(agentApi.customerAuth.tourist.verifyPassport);
  const sendTouristOtpMutation = useCreateData(agentApi.customerAuth.tourist.sendOtp);
  const resendTouristOtpMutation = useCreateData(agentApi.customerAuth.tourist.resendOtp);
  const validateTouristOtpMutation = useCreateData(agentApi.customerAuth.tourist.validateOtp);
  const createTouristAccountMutation = useCreateData(agentApi.customerAuth.tourist.createAccount);
  const verifyExpatriatePassportMutation = useCreateData(agentApi.customerAuth.expatriate.verifyPassport);
  const sendExpatriateOtpMutation = useCreateData(agentApi.customerAuth.expatriate.sendOtp);
  const resendExpatriateOtpMutation = useCreateData(agentApi.customerAuth.expatriate.resendOtp);
  const validateExpatriateOtpMutation = useCreateData(agentApi.customerAuth.expatriate.validateOtp);
  const createExpatriateAccountMutation = useCreateData(agentApi.customerAuth.expatriate.createAccount);

  const isSendingOtp =
    sendOtpMutation.isPending ||
    sendTouristOtpMutation.isPending ||
    sendExpatriateOtpMutation.isPending;
  const isResendingOtp =
    resendOtpMutation.isPending ||
    resendTouristOtpMutation.isPending ||
    resendExpatriateOtpMutation.isPending;

  const resetOtpState = () => {
    setOtp("");
    setIsOtpComplete(false);
    setOtpDeliveryMethod(null);
    setSelectedOtpMethod(null);
  };

  const resetState = () => {
    setStep("type-select");
    setSelectedType(null);
    setBvn("");
    setPassportNumber("");
    setPassportFile(null);
    setOtp("");
    setIsOtpComplete(false);
    setIsSubmitting(false);
    setVerificationToken(null);
    setOtpDeliveryMethod(null);
    setSelectedOtpMethod(null);
  };

  const handleCustomerCreated = () => {
    void queryClient.invalidateQueries({ queryKey: agentKeys.customers.all });
    setStep("success");
  };

  const handleTypeContinue = () => {
    if (selectedType === "resident") {
      setStep("resident-bvn");
    } else if (selectedType === "tourist" || selectedType === "expatriate") {
      setStep("passport-details");
    }
  };

  const handleBack = () => {
    if (step === "resident-bvn" || step === "passport-details") {
      setStep("type-select");
      setVerificationToken(null);
      resetOtpState();
      return;
    }

    if (step === "otp-delivery") {
      setStep(selectedType === "resident" ? "resident-bvn" : "passport-details");
      resetOtpState();
      return;
    }

    if (step === "verify-otp") {
      setStep("otp-delivery");
      setOtp("");
      setIsOtpComplete(false);
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

  const handleOtpDeliveryContinue = (method: OtpDeliveryMethod) => {
    if (!verificationToken) {
      handleApiError(
        { message: "Missing verification token", status: 400 },
        { customMessage: "Please complete verification first." }
      );
      return;
    }

    setOtpDeliveryMethod(method);
    setSelectedOtpMethod(method);

    const callbacks = {
      onSuccess: (response: { success: boolean; error?: { message?: string } }) => {
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
      onError: (error: Error) => {
        handleApiError(error, { customMessage: "Failed to send OTP. Please try again." });
      },
    };

    const payload = { verificationToken, verificationType: method };
    if (selectedType === "tourist") {
      sendTouristOtpMutation.mutate(payload, callbacks);
    } else if (selectedType === "expatriate") {
      sendExpatriateOtpMutation.mutate(payload, callbacks);
    } else {
      sendOtpMutation.mutate(payload, callbacks);
    }
  };

  const handlePassportContinue = () => {
    const normalizedPassportNumber = passportNumber.trim().toUpperCase();
    if (
      !PASSPORT_NUMBER_REGEX.test(normalizedPassportNumber) ||
      normalizedPassportNumber.length > 9
    ) {
      handleApiError(
        { message: "Invalid passport number", status: 400 },
        { customMessage: "Passport number must be alphanumeric and at most 9 characters." }
      );
      return;
    }

    if (!passportFile || (selectedType !== "tourist" && selectedType !== "expatriate")) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("passport", passportFile);

    uploadPassportMutation.mutate(formData, {
      onSuccess: (uploadResponse) => {
        if (!uploadResponse.success || !uploadResponse.data?.passportDocumentUrl) {
          setIsSubmitting(false);
          handleApiError(
            { message: uploadResponse.error?.message ?? "File upload failed", status: 400 },
            { customMessage: uploadResponse.error?.message ?? "Failed to upload passport. Please try again." }
          );
          return;
        }

        const verifyPayload = {
          passportDocumentUrl: uploadResponse.data.passportDocumentUrl,
          passportNumber: normalizedPassportNumber,
        };
        const callbacks = {
          onSuccess: (response: { success: boolean; data?: { verificationToken?: string }; error?: { message?: string } }) => {
            setIsSubmitting(false);
            if (response.success && response.data?.verificationToken) {
              setPassportNumber(normalizedPassportNumber);
              setVerificationToken(response.data.verificationToken);
              resetOtpState();
              setStep("otp-delivery");
            } else {
              handleApiError(
                { message: response.error?.message ?? "Passport verification failed", status: 400 },
                { customMessage: response.error?.message ?? "Passport verification failed. Please check and try again." }
              );
            }
          },
          onError: (error: Error) => {
            setIsSubmitting(false);
            handleApiError(error, { customMessage: "Failed to verify passport. Please try again." });
          },
        };

        if (selectedType === "tourist") {
          verifyTouristPassportMutation.mutate(verifyPayload, callbacks);
        } else {
          verifyExpatriatePassportMutation.mutate(verifyPayload, callbacks);
        }
      },
      onError: (error) => {
        setIsSubmitting(false);
        handleApiError(error, { customMessage: "Failed to upload passport. Please try again." });
      },
    });
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    setIsOtpComplete(true);
  };

  const handleResendOtp = () => {
    if (!verificationToken || !otpDeliveryMethod) return;
    setOtp("");
    setIsOtpComplete(false);

    const callbacks = {
      onSuccess: (response: { success: boolean; error?: { message?: string } }) => {
        if (!response.success) {
          handleApiError(
            { message: response.error?.message ?? "Failed to resend OTP", status: 400 },
            { customMessage: response.error?.message ?? "Failed to resend OTP. Please try again." }
          );
        }
      },
      onError: (error: Error) => {
        handleApiError(error, { customMessage: "Failed to resend OTP. Please try again." });
      },
    };

    const payload = { verificationToken, verificationType: otpDeliveryMethod };
    if (selectedType === "tourist") {
      resendTouristOtpMutation.mutate(payload, callbacks);
    } else if (selectedType === "expatriate") {
      resendExpatriateOtpMutation.mutate(payload, callbacks);
    } else {
      resendOtpMutation.mutate(payload, callbacks);
    }
  };

  const handleVerifyContinue = () => {
    if (!isOtpComplete || !selectedType || !verificationToken) return;
    setIsSubmitting(true);
    if (selectedType !== "resident") {
      const callbacks = {
        onSuccess: (validateRes: { success: boolean; data?: { validationToken?: string }; error?: { message?: string } }) => {
          if (!validateRes.success) {
            setIsSubmitting(false);
            handleApiError(
              { message: validateRes.error?.message ?? "OTP validation failed", status: 400 },
              { customMessage: validateRes.error?.message ?? "Invalid OTP. Please check and try again." }
            );
            return;
          }

          const tokenForCreate = validateRes.data?.validationToken ?? verificationToken;
          const createCallbacks = {
            onSuccess: (createRes: { success: boolean; error?: { message?: string } }) => {
              setIsSubmitting(false);
              if (createRes.success) {
                handleCustomerCreated();
              } else {
                handleApiError(
                  { message: createRes.error?.message ?? "Account creation failed", status: 400 },
                  { customMessage: createRes.error?.message ?? "Failed to create customer account. Please try again." }
                );
              }
            },
            onError: (error: Error) => {
              setIsSubmitting(false);
              handleApiError(error, { customMessage: "Failed to create customer account. Please try again." });
            },
          };

          const createPayload = {
            verificationToken: tokenForCreate,
            password: DEFAULT_AGENT_CUSTOMER_PASSWORD,
          };
          if (selectedType === "tourist") {
            createTouristAccountMutation.mutate(createPayload, createCallbacks);
          } else {
            createExpatriateAccountMutation.mutate(createPayload, createCallbacks);
          }
        },
        onError: (error: Error) => {
          setIsSubmitting(false);
          handleApiError(error, { customMessage: "Failed to validate OTP. Please try again." });
        },
      };

      const payload = { verificationToken, otp };
      if (selectedType === "tourist") {
        validateTouristOtpMutation.mutate(payload, callbacks);
      } else {
        validateExpatriateOtpMutation.mutate(payload, callbacks);
      }
      return;
    }

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
              password: DEFAULT_AGENT_CUSTOMER_PASSWORD,
              customerType: "NIGERIAN_CITIZEN",
            },
            {
              onSuccess: (createRes) => {
                setIsSubmitting(false);
                if (createRes.success) {
                  handleCustomerCreated();
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

  return {
    step,
    selectedType,
    setSelectedType,
    bvn,
    setBvn,
    passportNumber,
    setPassportNumber,
    passportFile,
    setPassportFile,
    isOtpComplete,
    isSubmitting,
    otpDeliveryMethod,
    selectedOtpMethod,
    setSelectedOtpMethod,
    isSendingOtp,
    isResendingOtp,
    resetState,
    handleTypeContinue,
    handleBack,
    handleResidentBvnContinue,
    handleOtpDeliveryContinue,
    handlePassportContinue,
    handleOtpComplete,
    handleResendOtp,
    handleVerifyContinue,
  };
}
