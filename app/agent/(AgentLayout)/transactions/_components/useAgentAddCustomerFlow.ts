"use client";

import { useState, useCallback } from "react";
import type { FileWithPath } from "@mantine/dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { PASSPORT_NUMBER_REGEX } from "@/app/(customer)/_utils/input-validation";
import { agentNigerianBvnConsentClient } from "@/app/_lib/nibss-bvn-consent/clients";
import {
  isValidEmail,
  isValidNigerianPhoneNumber,
  normalizeNigerianPhoneInput,
} from "@/app/_lib/nibss-bvn-consent/phone-validation";
import { useBvnConsentFlow } from "@/app/_lib/nibss-bvn-consent/use-bvn-consent-flow";

export type AgentCustomerType = "resident" | "tourist" | "expatriate";
export type AgentAddCustomerStep =
  | "type-select"
  | "resident-bvn"
  | "otp-delivery"
  | "expatriate-details"
  | "tourist-details"
  | "verify-otp"
  | "success";

export type OtpDeliveryMethod = "phone" | "email";

const DEFAULT_AGENT_CUSTOMER_PASSWORD = "securePass12!"; // NOSONAR: backend requires a password for agent-created customers.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useAgentAddCustomerFlow() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AgentAddCustomerStep>("type-select");
  const [selectedType, setSelectedType] = useState<AgentCustomerType | null>(null);
  const [bvn, setBvn] = useState("");
  const [residentEmail, setResidentEmail] = useState("");
  const [residentPhone, setResidentPhone] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportFile, setPassportFile] = useState<FileWithPath | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpDeliveryMethod, setOtpDeliveryMethod] = useState<OtpDeliveryMethod | null>(null);
  const [selectedOtpMethod, setSelectedOtpMethod] = useState<OtpDeliveryMethod | null>(null);

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

  const handleBvnConsentCompleted = useCallback(
    (data: { verificationToken?: string }) => {
      if (!data.verificationToken) {
        handleApiError(
          { message: "Missing verification token", status: 400 },
          { customMessage: "BVN consent completed but verification token is missing." }
        );
        return;
      }

      setVerificationToken(data.verificationToken);
      setIsSubmitting(false);
      setStep("otp-delivery");
    },
    []
  );

  const handleBvnConsentFailed = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  const bvnConsent = useBvnConsentFlow({
    client: agentNigerianBvnConsentClient,
    onCompleted: handleBvnConsentCompleted,
    onFailed: handleBvnConsentFailed,
  });

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
    setResidentEmail("");
    setResidentPhone("");
    setPassportNumber("");
    setPassportFile(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setOtp("");
    setIsOtpComplete(false);
    setIsSubmitting(false);
    setVerificationToken(null);
    setOtpDeliveryMethod(null);
    setSelectedOtpMethod(null);
    bvnConsent.reset();
  };

  const handleCustomerCreated = () => {
    void queryClient.invalidateQueries({ queryKey: agentKeys.customers.all });
    setStep("success");
  };

  const handleTypeContinue = () => {
    if (selectedType === "resident") {
      setStep("resident-bvn");
    } else if (selectedType === "tourist") {
      setStep("tourist-details");
    } else if (selectedType === "expatriate") {
      setStep("expatriate-details");
    }
  };

  const handleBack = () => {
    if (
      step === "resident-bvn" ||
      step === "expatriate-details" ||
      step === "tourist-details"
    ) {
      setStep("type-select");
      setVerificationToken(null);
      resetOtpState();
      return;
    }

    if (step === "otp-delivery") {
      setStep(selectedType === "resident" ? "resident-bvn" : "expatriate-details");
      resetOtpState();
      return;
    }

    if (step === "verify-otp") {
      if (selectedType === "tourist") {
        setStep("tourist-details");
      } else {
        setStep("otp-delivery");
      }
      setOtp("");
      setIsOtpComplete(false);
    }
  };

  const validatePassportNumber = (value: string): string | null => {
    const normalized = value.trim().toUpperCase();
    if (!PASSPORT_NUMBER_REGEX.test(normalized) || normalized.length > 9) {
      return "Passport number must be alphanumeric and at most 9 characters.";
    }
    return null;
  };

  const uploadPassportAndVerify = async (
    verify: (passportDocumentUrl: string, normalizedPassportNumber: string) => void
  ) => {
    if (!passportFile) return;

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

        const normalizedPassportNumber = passportNumber.trim().toUpperCase();
        verify(uploadResponse.data.passportDocumentUrl, normalizedPassportNumber);
      },
      onError: (error) => {
        setIsSubmitting(false);
        handleApiError(error, { customMessage: "Failed to upload passport. Please try again." });
      },
    });
  };

  const handleResidentBvnContinue = () => {
    const normalizedPhone = normalizeNigerianPhoneInput(residentPhone);

    if (
      bvn.length !== 11 ||
      !isValidEmail(residentEmail) ||
      !isValidNigerianPhoneNumber(normalizedPhone) ||
      bvnConsent.isActive
    ) {
      return;
    }

    setIsSubmitting(true);
    void bvnConsent.startConsent({
      bvn,
      email: residentEmail.trim(),
      phoneNumber: normalizedPhone,
    });
  };

  const handleResidentPhoneChange = (value: string) => {
    setResidentPhone(normalizeNigerianPhoneInput(value));
  };

  const handleBvnConsentCancel = () => {
    bvnConsent.cancel();
    bvnConsent.reset();
    setIsSubmitting(false);
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
    if (selectedType === "expatriate") {
      sendExpatriateOtpMutation.mutate(payload, callbacks);
    } else {
      sendOtpMutation.mutate(payload, callbacks);
    }
  };

  const sendTouristEmailOtp = (token: string, customerEmail: string) => {
    sendTouristOtpMutation.mutate(
      { verificationToken: token, email: customerEmail.trim() },
      {
        onSuccess: (response) => {
          setIsSubmitting(false);
          if (response.success) {
            setOtpDeliveryMethod("email");
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
          setIsSubmitting(false);
          handleApiError(error, { customMessage: "Failed to send OTP. Please try again." });
        },
      }
    );
  };

  const handleExpatriateContinue = () => {
    if (bvn.length !== 11) {
      handleApiError(
        { message: "Invalid BVN", status: 400 },
        { customMessage: "BVN must be 11 digits." }
      );
      return;
    }

    const passportError = validatePassportNumber(passportNumber);
    if (passportError) {
      handleApiError({ message: passportError, status: 400 }, { customMessage: passportError });
      return;
    }

    if (!passportFile) return;

    void uploadPassportAndVerify((passportDocumentUrl, normalizedPassportNumber) => {
      verifyExpatriatePassportMutation.mutate(
        {
          passportDocumentUrl,
          passportNumber: normalizedPassportNumber,
          bvn,
        },
        {
          onSuccess: (response) => {
            setIsSubmitting(false);
            if (response.success && response.data?.verificationToken) {
              setPassportNumber(normalizedPassportNumber);
              setVerificationToken(response.data.verificationToken);
              resetOtpState();
              setStep("otp-delivery");
            } else {
              handleApiError(
                { message: response.error?.message ?? "Verification failed", status: 400 },
                { customMessage: response.error?.message ?? "Verification failed. Please check and try again." }
              );
            }
          },
          onError: (error) => {
            setIsSubmitting(false);
            handleApiError(error, { customMessage: "Failed to verify details. Please try again." });
          },
        }
      );
    });
  };

  const handleTouristContinue = () => {
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      handleApiError(
        { message: "Invalid email", status: 400 },
        { customMessage: "Please enter a valid email address." }
      );
      return;
    }

    if (!trimmedFirstName || !trimmedLastName) {
      handleApiError(
        { message: "Missing name", status: 400 },
        { customMessage: "First name and last name are required." }
      );
      return;
    }

    if (!dateOfBirth.trim()) {
      handleApiError(
        { message: "Missing date of birth", status: 400 },
        { customMessage: "Date of birth is required." }
      );
      return;
    }

    const passportError = validatePassportNumber(passportNumber);
    if (passportError) {
      handleApiError({ message: passportError, status: 400 }, { customMessage: passportError });
      return;
    }

    if (!passportFile) return;

    void uploadPassportAndVerify((passportDocumentUrl, normalizedPassportNumber) => {
      verifyTouristPassportMutation.mutate(
        {
          passportDocumentUrl,
          passportNumber: normalizedPassportNumber,
          email: trimmedEmail,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          dateOfBirth: dateOfBirth.trim(),
        },
        {
          onSuccess: (response) => {
            if (response.success && response.data?.verificationToken) {
              setPassportNumber(normalizedPassportNumber);
              setVerificationToken(response.data.verificationToken);
              sendTouristEmailOtp(response.data.verificationToken, trimmedEmail);
            } else {
              setIsSubmitting(false);
              handleApiError(
                { message: response.error?.message ?? "Verification failed", status: 400 },
                { customMessage: response.error?.message ?? "Verification failed. Please check and try again." }
              );
            }
          },
          onError: (error) => {
            setIsSubmitting(false);
            handleApiError(error, { customMessage: "Failed to verify details. Please try again." });
          },
        }
      );
    });
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    setIsOtpComplete(true);
  };

  const handleResendOtp = () => {
    if (!verificationToken) return;
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

    if (selectedType === "tourist") {
      resendTouristOtpMutation.mutate(
        { verificationToken, email: email.trim() },
        callbacks
      );
      return;
    }

    if (!otpDeliveryMethod) return;

    const payload = { verificationToken, verificationType: otpDeliveryMethod };
    if (selectedType === "expatriate") {
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

      if (selectedType === "tourist") {
        validateTouristOtpMutation.mutate(
          { verificationToken, otp, email: email.trim() },
          callbacks
        );
      } else {
        validateExpatriateOtpMutation.mutate({ verificationToken, otp }, callbacks);
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
    residentEmail,
    setResidentEmail,
    residentPhone,
    setResidentPhone,
    handleResidentPhoneChange,
    bvnConsent,
    handleBvnConsentCancel,
    passportNumber,
    setPassportNumber,
    passportFile,
    setPassportFile,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    dateOfBirth,
    setDateOfBirth,
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
    handleExpatriateContinue,
    handleTouristContinue,
    handleOtpComplete,
    handleResendOtp,
    handleVerifyContinue,
  };
}
