"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPSentModal } from "@/app/(customer)/_components/modals/OTPSentModal";
import { Button, Alert } from "@mantine/core";
import { ArrowUpRight, ArrowLeft, InfoIcon } from "lucide-react";
import {
  validateUserType,
  getNextStep,
  checkAndClearSessionIfUserTypeChanged
} from "@/app/(customer)/_utils/auth-flow";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [otpSentOpened, { open: openOTPSent, close: closeOTPSent }] =
    useDisclosure(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [userData, setUserData] = useState(() => {
    if (typeof window === "undefined") {
      return { fullName: "", phoneNumber: "", email: "", address: "", nationality: "" };
    }
    return {
      fullName: sessionStorage.getItem("fullName") || "",
      phoneNumber: sessionStorage.getItem("phoneNumber") || "",
      email: sessionStorage.getItem("email") || "",
      address: sessionStorage.getItem("address") || "",
      nationality: sessionStorage.getItem("nationality") || ""
    };
  });

  useEffect(() => {
    if (!userType) {
      router.push("/auth/onboarding");
      return;
    }

    checkAndClearSessionIfUserTypeChanged(userType);

    const verificationToken = sessionStorage.getItem("verificationToken");
    if (!verificationToken) {
      router.push(userType === "citizen" ? `/auth/${userType}/bvn` : `/auth/${userType}/upload-passport`);
      return;
    }
  }, [userType, router]);

  const sendEmailOtpNigerianMutation = useCreateData(customerApi.auth.nigerian.sendEmailOtp);
  const sendOtpTouristMutation = useCreateData(customerApi.auth.tourist.sendOtp);

  const handleSendOTP = () => {
    if (userType && !isSendingOTP) {
      setIsSendingOTP(true);
      const onSuccess = (response: { success: boolean; error?: { message?: string } }) => {
        if (response.success) {
          setIsSendingOTP(false);
          sessionStorage.setItem("userType", userType);
          openOTPSent();
        } else {
          setIsSendingOTP(false);
          handleApiError(
            { message: response.error?.message || "Failed to send OTP", status: 400 },
            { customMessage: response.error?.message || "Failed to send OTP. Please try again." }
          );
        }
      };

      const onError = (error: unknown) => {
        setIsSendingOTP(false);
        handleApiError(error, { customMessage: "Failed to send OTP. Please try again." });
      };

      if (userType === "citizen") {
        const email = sessionStorage.getItem("email");
        if (!email) {
          setIsSendingOTP(false);
          handleApiError(
            { message: "Email required", status: 400 },
            { customMessage: "Email not found. Please complete BVN verification first." }
          );
          return;
        }
        const validationToken = sessionStorage.getItem("validationToken");
        if (!validationToken) {
          setIsSendingOTP(false);
          handleApiError(
            { message: "Validation token required", status: 400 },
            { customMessage: "Please complete OTP validation first." }
          );
          return;
        }
        sendEmailOtpNigerianMutation.mutate(
          { email, verificationToken: validationToken },
          { onSuccess, onError }
        );
        return;
      }

      const email = sessionStorage.getItem("email");
      if (!email) {
        setIsSendingOTP(false);
        handleApiError(
          { message: "Email required", status: 400 },
          { customMessage: "Email not found. Please complete passport verification first." }
        );
        return;
      }

      const verificationToken = sessionStorage.getItem("verificationToken");
      if (!verificationToken) {
        setIsSendingOTP(false);
        handleApiError(
          { message: "Verification token not found", status: 400 },
          { customMessage: "Please complete passport verification first." }
        );
        return;
      }

      sendOtpTouristMutation.mutate(
        { email, verificationToken },
        { onSuccess, onError }
      );
    }
  };

  const handleGoToEmail = () => {
    if (userType) {
      closeOTPSent();
      router.push(getNextStep(userType, "review"));
    }
  };

  if (!userType) {
    return null;
  }

  const verificationSource = userType === "citizen" ? "BVN" : "passport";

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push(userType === "citizen" ? `/auth/${userType}/bvn` : `/auth/${userType}/upload-passport`)}
          className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
        >
          Back
        </Button>
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Final Step Ahead.
          </h1>
          <p className="text-body-text-100 text-base">
            We&apos;ll send an OTP to your email to complete this step.
          </p>
        </div>

        <div className="bg-bg-card rounded-2xl border border-gray-100 p-6 space-y-0">
          {/* Full Name */}
          <div className="flex justify-between items-start py-6 border-b border-gray-100">
            <span className="text-text-300 text-base">Full Name</span>
            <span className="text-heading-200 text-base font-medium">
              {userData.fullName}
            </span>
          </div>

          {/* Phone Number */}
          <div className="flex justify-between items-start py-6 border-b border-gray-100">
            <span className="text-text-300 text-base">Phone Number</span>
            <span className="text-heading-200 text-base font-medium">
              {userData.phoneNumber}
            </span>
          </div>

          {/* Email Address */}
          <div className="flex justify-between items-start py-6 border-b border-gray-100">
            <span className="text-text-300 text-base">Email Address</span>
            <span className="text-heading-200 text-base font-medium">
              {userData.email}
            </span>
          </div>

          {userType === "expatriate" ? (
            <div className="flex justify-between items-start py-6">
              <span className="text-text-300 text-base">Nationality</span>
              <span className="text-heading-200 text-base font-medium">
                {userData.nationality}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-start py-6">
              <span className="text-text-300 text-base">Address</span>
              <span className="text-heading-200 text-base font-medium">
                {userData.address}
              </span>
            </div>
          )}
        </div>

        <Alert
          icon={<InfoIcon size={18} className="text-primary-400" />}
          color="#F8DCCD"
          className="bg-primary-25! "
        >
          <p className="text-primary-400 text-base">
            Details above can&apos;t be changed because they are pulled directly
            from your {verificationSource}.
          </p>
        </Alert>

        <Button
          onClick={handleSendOTP}
          disabled={isSendingOTP}
          loading={isSendingOTP}
          variant="filled"
          size="lg"
          radius="xl"
          fullWidth
          rightSection={!isSendingOTP && <ArrowUpRight size={18} />}
        >
          {isSendingOTP ? "Sending OTP..." : "Send OTP"}
        </Button>

        <SecurityBadges />
      </div>

      <OTPSentModal
        opened={otpSentOpened}
        onClose={closeOTPSent}
        onGoToEmail={handleGoToEmail}
        email={userData.email}
      />
    </>
  );
}
