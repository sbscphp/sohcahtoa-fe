"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPDeliveryModal } from "@/app/(customer)/_components/modals/OTPDeliveryModal";
import { VerifyBVNModal } from "@/app/(customer)/_components/modals/VerifyBVNModal";
import { BvnConsentOverlay } from "@/app/_components/nibss-bvn-consent/BvnConsentOverlay";
import { TextInput, Button } from "@mantine/core";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { validateUserType, checkAndClearSessionIfUserTypeChanged } from "@/app/(customer)/_utils/auth-flow";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { notifications } from "@mantine/notifications";
import { customerNigerianBvnConsentClient } from "@/app/_lib/nibss-bvn-consent/clients";
import { persistVerificationProfile } from "@/app/_lib/nibss-bvn-consent/persist-verification-profile";
import { useBvnConsentFlow } from "@/app/_lib/nibss-bvn-consent/use-bvn-consent-flow";

export default function BVNPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [bvn, setBvn] = useState("");
  const [
    otpDeliveryOpened,
    { open: openOTPDelivery, close: closeOTPDelivery }
  ] = useDisclosure(false);
  const [verifyBVNOpened, { open: openVerifyBVN, close: closeVerifyBVN }] =
    useDisclosure(false);
  const [deliveryMethod, setDeliveryMethod] = useState<
    "phone" | "email" | null
  >(null);

  const handleConsentCompleted = useCallback(
    (data: Parameters<typeof persistVerificationProfile>[0]) => {
      persistVerificationProfile(data, { bvn, userType: userType ?? undefined });
      openOTPDelivery();
    },
    [bvn, openOTPDelivery, userType]
  );

  const bvnConsent = useBvnConsentFlow({
    client: customerNigerianBvnConsentClient,
    onCompleted: handleConsentCompleted,
  });

  useEffect(() => {
    if (!userType || userType !== "citizen") {
      router.push("/auth/onboarding");
      return;
    }

    checkAndClearSessionIfUserTypeChanged(userType);
  }, [userType, router]);

  const isFormValid = bvn.length === 11;

  const handleVerify = () => {
    if (!isFormValid || !userType || bvnConsent.isActive) return;

    void bvnConsent.startConsent({ bvn });
  };

  const handleConsentCancel = () => {
    bvnConsent.cancel();
    bvnConsent.reset();
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

    sendOtpMutation.mutate(
      {
        verificationToken,
        verificationType: method,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            const otp = (response as { data?: { otp?: string } })?.data?.otp;
            if (otp) {
              notifications.show({
                title: "DEV OTP",
                message: `OTP: ${otp}`,
                color: "blue",
                autoClose: 8000,
              });
            }
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

  const consentOverlayOpen =
    bvnConsent.phase !== "idle" && bvnConsent.phase !== "completed";

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
            Please enter your BVN. You&apos;ll complete a quick NIBSS consent step
            before we verify your identity.
          </p>
        </div>

        <div className="space-y-4">
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
        </div>

        <Button
          onClick={handleVerify}
          disabled={!isFormValid || bvnConsent.isActive}
          loading={bvnConsent.isActive}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={!bvnConsent.isActive && <ArrowUpRight size={18} />}
        >
          {bvnConsent.isActive ? "Starting consent…" : "Continue to NIBSS consent"}
        </Button>

        <SecurityBadges />
      </div>

      <BvnConsentOverlay
        opened={consentOverlayOpen}
        phase={bvnConsent.phase}
        statusMessage={bvnConsent.statusMessage}
        usedPopup={bvnConsent.usedPopup}
        onOpenPortal={bvnConsent.openConsentPortal}
        onRetry={() => void bvnConsent.retryPolling()}
        onCancel={handleConsentCancel}
      />

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
