"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPInput } from "@/app/(customer)/_components/auth/OTPInput";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import {
  validateUserType,
  getNextStep,
  checkAndClearSessionIfUserTypeChanged,
} from "@/app/(customer)/_utils/auth-flow";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (!userType) {
      router.push("/auth/onboarding");
      return;
    }

    checkAndClearSessionIfUserTypeChanged(userType);

    if (userType === "citizen") {
      const verificationToken = sessionStorage.getItem("verificationToken");
      const validationToken = sessionStorage.getItem("validationToken");
      router.push(
        verificationToken || validationToken
          ? `/auth/${userType}/create-password`
          : `/auth/${userType}/bvn`
      );
      return;
    }

    const storedEmail = sessionStorage.getItem("email");
    const verificationToken = sessionStorage.getItem("verificationToken");
    if (!storedEmail || !verificationToken) {
      router.push(`/auth/${userType}/review`);
      return;
    }

    setUserEmail(storedEmail);
  }, [userType, router]);

  const validateOtpTouristMutation = useCreateData(
    customerApi.auth.tourist.validateOtp
  );
  const resendOtpTouristMutation = useCreateData(
    customerApi.auth.tourist.resendOtp
  );

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleVerify = () => {
    if (!isComplete || !userType || userType === "citizen" || isValidating) {
      return;
    }

    setIsValidating(true);

    const verificationToken = sessionStorage.getItem("verificationToken");

    if (!userEmail) {
      setIsValidating(false);
      handleApiError(
        { message: "Email required", status: 400 },
        {
          customMessage:
            "Email not found. Please complete passport verification first.",
        }
      );
      return;
    }

    if (!verificationToken) {
      setIsValidating(false);
      handleApiError(
        { message: "Missing required data", status: 400 },
        { customMessage: "Please complete the previous steps first." }
      );
      return;
    }

    validateOtpTouristMutation.mutate(
      {
        email: userEmail,
        otp,
        verificationToken,
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            if (response.data.firstName) {
              sessionStorage.setItem("firstName", response.data.firstName);
            }
            if (response.data.lastName) {
              sessionStorage.setItem("lastName", response.data.lastName);
            }
            if (response.data.email) {
              sessionStorage.setItem("email", response.data.email);
            }
            if (response.data.phoneNumber) {
              sessionStorage.setItem("phoneNumber", response.data.phoneNumber);
            }
            if (response.data.address) {
              sessionStorage.setItem("address", response.data.address);
            }
            if (response.data.firstName && response.data.lastName) {
              sessionStorage.setItem(
                "fullName",
                `${response.data.firstName} ${response.data.lastName}`
              );
            }
            if (response.data.validationToken) {
              sessionStorage.setItem(
                "validationToken",
                response.data.validationToken
              );
            }
            setSuccessMessage(
              response.data.message ||
                "Your email has been successfully verified. Continue below to complete account creation."
            );
            setIsValidating(false);
            setSuccessOpened(true);
          } else {
            setIsValidating(false);
            handleApiError(
              {
                message: response.error?.message || "OTP validation failed",
                status: 400,
              },
              {
                customMessage:
                  response.error?.message ||
                  "Invalid OTP. Please check and try again.",
              }
            );
          }
        },
        onError: (error) => {
          setIsValidating(false);
          handleApiError(error, {
            customMessage: "Failed to validate OTP. Please try again.",
          });
        },
      }
    );
  };

  const handleResend = () => {
    if (!userType || userType === "citizen") return;

    setIsResending(true);
    setOtp("");
    setIsComplete(false);

    const verificationToken = sessionStorage.getItem("verificationToken");
    if (!verificationToken || !userEmail) {
      setIsResending(false);
      handleApiError(
        { message: "Missing required data", status: 400 },
        { customMessage: "Please complete the previous steps first." }
      );
      return;
    }

    resendOtpTouristMutation.mutate(
      {
        email: userEmail,
        verificationToken,
      },
      {
        onSuccess: (response) => {
          setIsResending(false);
          if (response.success) {
            setOtp("");
            setIsComplete(false);
            notifications.show({
              title: "OTP Resent",
              message:
                response.data?.message ||
                "OTP has been resent to your email address.",
              color: "green",
              autoClose: 5000,
            });
          } else {
            handleApiError(
              {
                message: response.error?.message || "Failed to resend OTP",
                status: 400,
              },
              {
                customMessage:
                  response.error?.message ||
                  "Failed to resend OTP. Please try again.",
              }
            );
          }
        },
        onError: (error) => {
          setIsResending(false);
          handleApiError(error, {
            customMessage: "Failed to resend OTP. Please try again.",
          });
        },
      }
    );
  };

  const handleSuccessContinue = () => {
    setSuccessOpened(false);
    setSuccessMessage("");
    if (userType) {
      router.push(getNextStep(userType, "verify-email"));
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpened(false);
    setSuccessMessage("");
  };

  if (!userType || userType === "citizen") {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push(`/auth/${userType}/review`)}
          className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
        >
          Back
        </Button>
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Validate Your Email Address
          </h1>
          <p className="text-body-text-100 text-base">
            Enter the 6-digit OTP sent to your email address associated with
            this account {userEmail || "your email"}
          </p>
        </div>

        <OTPInput
          onComplete={handleOTPComplete}
          onResend={handleResend}
          expiryMinutes={5}
          isResending={isResending}
        />

        <Button
          onClick={handleVerify}
          disabled={!isComplete || isValidating}
          loading={isValidating}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={!isValidating && <ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          {isValidating ? "Verifying..." : "Verify"}
        </Button>

        <SecurityBadges />
      </div>

      <SuccessModal
        opened={successOpened}
        onClose={handleSuccessClose}
        title="Email Verified Successfully"
        message={
          successMessage ||
          "Your email has been successfully verified. Continue below to complete account creation."
        }
        buttonText="Continue"
        onButtonClick={handleSuccessContinue}
      />
    </>
  );
}
