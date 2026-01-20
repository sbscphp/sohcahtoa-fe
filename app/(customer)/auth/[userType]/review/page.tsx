"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { AuthLayout } from "@/app/(customer)/_components/auth/AuthLayout";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPSentModal } from "@/app/(customer)/_components/modals/OTPSentModal";
import { Button, Alert } from "@mantine/core";
import { ArrowUpRight, InfoIcon } from "lucide-react";
import {
  validateUserType,
  getNextStep
} from "@/app/(customer)/_utils/auth-flow";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [otpSentOpened, { open: openOTPSent, close: closeOTPSent }] =
    useDisclosure(false);

  useEffect(() => {
    if (!userType) {
      router.push("/auth/onboarding");
    }
  }, [userType, router]);

  // Mock data - in real app, this would come from API after BVN/passport verification
  const userData = {
    fullName: "Fiyinfolwa Fajuyi Keme",
    phoneNumber: "+234 90 **** ** 91",
    email: "fiy************@gmail.com",
    address: "No 14A, Karimu Kotun Street, V.I Lagos"
  };

  const handleSendOTP = () => {
    if (userType) {
      // Store email in sessionStorage for the verify email page
      sessionStorage.setItem("email", userData.email);
      sessionStorage.setItem("userType", userType);
      openOTPSent();
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
    <AuthLayout>
      <div className="space-y-8">
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

          {/* Address */}
          <div className="flex justify-between items-start py-6">
            <span className="text-text-300 text-base">Address</span>
            <span className="text-heading-200 text-base font-medium">
              {userData.address}
            </span>
          </div>
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
          variant="filled"
          size="lg"
          radius="xl"
          fullWidth
          rightSection={<ArrowUpRight size={18} />}
        >
          Send OTP
        </Button>

        <SecurityBadges />
      </div>

      <OTPSentModal
        opened={otpSentOpened}
        onClose={closeOTPSent}
        onGoToEmail={handleGoToEmail}
        email={userData.email}
      />
    </AuthLayout>
  );
}
