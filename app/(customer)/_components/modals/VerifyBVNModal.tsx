import { Modal, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { OTPInput } from '../auth/OTPInput';
import { SuccessModal } from './SuccessModal';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { useCreateData } from '@/app/_lib/api/hooks';
import { customerApi } from '@/app/(customer)/_services/customer-api';
import { handleApiError } from '@/app/_lib/api/error-handler';

interface VerifyBVNModalProps {
  opened: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  bvn: string;
  deliveryMethod: 'phone' | 'email';
}

export function VerifyBVNModal({ opened, onClose, onVerify, bvn, deliveryMethod }: VerifyBVNModalProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const validateOtpMutation = useCreateData(customerApi.auth.nigerian.validateOtp);
  const resendOtpMutation = useCreateData(customerApi.auth.nigerian.resendOtp);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleContinue = () => {
    if (isComplete && !isValidating) {
      const verificationToken = sessionStorage.getItem("verificationToken");

      if (!verificationToken) {
        handleApiError(
          { message: "Missing verification token", status: 400 },
          { customMessage: "Please complete BVN verification first." }
        );
        return;
      }

      setIsValidating(true);
      validateOtpMutation.mutate(
        {
          otp,
          verificationToken,
        },
        {
          onSuccess: (response) => {
            if (response.success && response.data) {
              // Store user data from validate-otp response
              if (response.data.firstName) sessionStorage.setItem("firstName", response.data.firstName);
              if (response.data.lastName) sessionStorage.setItem("lastName", response.data.lastName);
              if (response.data.email) sessionStorage.setItem("email", response.data.email);
              if (response.data.phoneNumber) sessionStorage.setItem("phoneNumber", response.data.phoneNumber);
              if (response.data.address) sessionStorage.setItem("address", response.data.address);
              if (response.data.firstName && response.data.lastName) {
                sessionStorage.setItem("fullName", `${response.data.firstName} ${response.data.lastName}`);
              }
              
              if (response.data.validationToken) {
                sessionStorage.setItem("validationToken", response.data.validationToken);
              } else {
                const currentVerificationToken = sessionStorage.getItem("verificationToken");
                if (currentVerificationToken) {
                  sessionStorage.setItem("validationToken", currentVerificationToken);
                }
              }
              
              if (response.data.message) {
                setSuccessMessage(response.data.message);
              } else {
                setSuccessMessage("Your BVN has been successfully verified. Continue below to complete account creation.");
              }
              
              setIsValidating(false);
              onClose();
              setSuccessOpened(true);
            } else {
              setIsValidating(false);
              handleApiError(
                { message: response.error?.message || "OTP validation failed", status: 400 },
                { customMessage: response.error?.message || "Invalid OTP. Please check and try again." }
              );
            }
          },
          onError: (error) => {
            setIsValidating(false);
            handleApiError(error, { customMessage: "Failed to validate OTP. Please try again." });
          },
        }
      );
    }
  };

  const handleSuccessContinue = () => {
    setSuccessOpened(false);
    setSuccessMessage("");
    onClose();
    const userType = sessionStorage.getItem("userType") || "citizen";
    router.push(`/auth/${userType}/review`);
  };

  const handleSuccessClose = () => {
    setSuccessOpened(false);
    setSuccessMessage("");
  };

  const handleResend = () => {
    const verificationToken = sessionStorage.getItem("verificationToken");

    if (!verificationToken) {
      handleApiError(
        { message: "Missing verification token", status: 400 },
        { customMessage: "Please complete BVN verification first." }
      );
      return;
    }

    setIsResending(true);
    setOtp('');
    setIsComplete(false);

    const deliveryMethod = sessionStorage.getItem("otpDeliveryMethod") as "phone" | "email" | null;
    if (!deliveryMethod) {
      handleApiError(
        { message: "Missing delivery method", status: 400 },
        { customMessage: "Please select delivery method first." }
      );
      setIsResending(false);
      return;
    }

    resendOtpMutation.mutate(
      {
        verificationToken,
        verificationType: deliveryMethod,
      },
      {
        onSuccess: (response) => {
          setIsResending(false);
          if (response.success) {
            setOtp("");
            setIsComplete(false);
            notifications.show({
              title: "OTP Resent",
              message: response.data?.message || `OTP has been resent to your ${deliveryMethod === 'phone' ? 'phone number' : 'email'}.`,
              color: "green",
              autoClose: 5000,
            });
          } else {
            handleApiError(
              { message: response.error?.message || "Failed to resend OTP", status: 400 },
              { customMessage: response.error?.message || "Failed to resend OTP. Please try again." }
            );
          }
        },
        onError: (error) => {
          setIsResending(false);
          handleApiError(error, { customMessage: "Failed to resend OTP. Please try again." });
        },
      }
    );
  };

  const maskedBvn = `${bvn.slice(0, 3)}*****${bvn.slice(-3)}`;
  const maskedInfo = `A six (6) digit OTP has been sent to your ${deliveryMethod === 'phone' ? 'phone number' : 'email'} linked to BVN ${maskedBvn}. Enter to verify`;

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="" centered radius="xl" size="500px" withCloseButton={false}>
        <div className="space-y-6 p-3">
          <div>
            <h2 className="text-body-heading-200 text-2xl font-semibold">
              Verify BVN
            </h2>
            <OTPInput
              onComplete={handleOTPComplete}
              onResend={handleResend}
              maskedInfo={maskedInfo}
              isResending={isResending}
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!isComplete || isValidating}
            loading={isValidating}
            variant="filled"
            fullWidth
            radius="xl"
            rightSection={!isValidating && <ArrowUpRight size={18} />}
            className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6 disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
          >
            {isValidating ? "Verifying..." : "Continue"}
          </Button>
        </div>
      </Modal>

      <SuccessModal
        opened={successOpened}
        onClose={handleSuccessClose}
        title="BVN Verified Successfully"
        message={successMessage || "Your BVN has been successfully verified. Continue below to complete account creation."}
        buttonText="Continue"
        onButtonClick={handleSuccessContinue}
      />
    </>
  );
}
