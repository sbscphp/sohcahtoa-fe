"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPDeliveryModal } from "@/app/(customer)/_components/modals/OTPDeliveryModal";
import { VerifyBVNModal } from "@/app/(customer)/_components/modals/VerifyBVNModal";
import { TextInput, Button } from "@mantine/core";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { validateUserType, checkAndClearSessionIfUserTypeChanged } from "@/app/(customer)/_utils/auth-flow";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";

export default function BVNPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [bvn, setBvn] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [
    otpDeliveryOpened,
    { open: openOTPDelivery, close: closeOTPDelivery }
  ] = useDisclosure(false);
  const [verifyBVNOpened, { open: openVerifyBVN, close: closeVerifyBVN }] =
    useDisclosure(false);
  const [deliveryMethod, setDeliveryMethod] = useState<
    "phone" | "email" | null
  >(null);

  const verifyBvnMutation = useCreateData(customerApi.auth.nigerian.verifyBvn);

  useEffect(() => {
    if (!userType || userType !== "citizen") {
      router.push("/auth/onboarding");
      return;
    }
    
    checkAndClearSessionIfUserTypeChanged(userType);
  }, [userType, router]);

  const handleVerify = () => {
    if (bvn.length === 11 && userType && !isVerifying) {
      setIsVerifying(true);
      verifyBvnMutation.mutate({ bvn }, {
        onSuccess: (response) => {
          if (response.success && response.data) {
            // Store verificationToken and user data for next steps
            sessionStorage.setItem("verificationToken", response.data.verificationToken);
            sessionStorage.setItem("bvn", bvn);
            sessionStorage.setItem("userType", userType || "");
            // Store user data from API response
            if (response.data.email) sessionStorage.setItem("email", response.data.email);
            if (response.data.fullName) sessionStorage.setItem("fullName", response.data.fullName);
            if (response.data.phoneNumber) sessionStorage.setItem("phoneNumber", response.data.phoneNumber);
            if (response.data.address) sessionStorage.setItem("address", response.data.address);
            setIsVerifying(false);
            openOTPDelivery();
          } else {
            setIsVerifying(false);
            handleApiError(
              { message: response.error?.message || "BVN verification failed", status: 400 },
              { customMessage: response.error?.message || "BVN verification failed. Please check your BVN and try again." }
            );
          }
        },
        onError: (error) => {
          setIsVerifying(false);
          handleApiError(error, { customMessage: "Failed to verify BVN. Please try again." });
        },
      });
    }
  };

  const sendOtpMutation = useCreateData(customerApi.auth.nigerian.sendOtp);

  const handleOTPDeliveryContinue = (method: "phone" | "email") => {
    const verificationToken = sessionStorage.getItem("verificationToken");

    if (!verificationToken) {
      handleApiError(
        { message: "Missing verification token", status: 400 },
        { customMessage: "Please complete BVN verification first." }
      );
      return;
    }

    setDeliveryMethod(method);
    sessionStorage.setItem("otpDeliveryMethod", method);
    
    // Send OTP to selected method (phone or email)
    sendOtpMutation.mutate(
      {
        verificationToken,
        verificationType: method,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            closeOTPDelivery();
            openVerifyBVN();
          } else {
            handleApiError(
              { message: response.error?.message || "Failed to send OTP", status: 400 },
              { customMessage: response.error?.message || "Failed to send OTP. Please try again." }
            );
          }
        },
        onError: (error) => {
          handleApiError(error, { customMessage: "Failed to send OTP. Please try again." });
        },
      }
    );
  };

  const handleBVNVerified = () => {
    if (userType) {
      closeVerifyBVN();
    }
  };

  if (!userType || userType !== "citizen") {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push("/auth/onboarding")}
          className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
        >
          Back
        </Button>
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Let&apos;s Get you Started.
          </h1>
          <p className="text-body-text-100 text-base">
            Please enter your BVN. This is required for identity verification
            and security. Your details are safe and will not be shared.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-body-text-100 text-base font-medium">
            BVN
          </label>
          <TextInput
            value={bvn}
            onChange={(e) =>
              setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            placeholder="Enter your BVN"
            size="lg"
            maxLength={11}
          />
          <p className="text-text-200 text-sm">
            If you can&apos;t remember, please dial{" "}
            <span className="font-semibold">*565*0#</span> with your registered
            SIM to get started.
          </p>
        </div>

        <Button
          onClick={handleVerify}
          disabled={bvn.length !== 11 || isVerifying}
          loading={isVerifying}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={!isVerifying && <ArrowUpRight size={18} />}
        >
          {isVerifying ? "Verifying..." : "Verify BVN"}
        </Button>

        <SecurityBadges />
      </div>

      <OTPDeliveryModal
        opened={otpDeliveryOpened}
        onClose={closeOTPDelivery}
        onContinue={handleOTPDeliveryContinue}
      />

      {deliveryMethod && (
        <VerifyBVNModal
          opened={verifyBVNOpened}
          onClose={closeVerifyBVN}
          onVerify={handleBVNVerified}
          bvn={bvn}
          deliveryMethod={deliveryMethod}
        />
      )}
    </>
  );
}
