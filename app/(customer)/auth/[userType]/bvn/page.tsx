"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { AuthLayout } from "@/app/(customer)/_components/auth/AuthLayout";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { OTPDeliveryModal } from "@/app/(customer)/_components/modals/OTPDeliveryModal";
import { VerifyBVNModal } from "@/app/(customer)/_components/modals/VerifyBVNModal";
import { TextInput, Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { validateUserType, getNextStep } from "@/app/(customer)/_utils/auth-flow";

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

  useEffect(() => {
    // Redirect if not citizen or invalid userType
    if (!userType || userType !== "citizen") {
      router.push("/auth/onboarding");
    }
  }, [userType, router]);

  const handleVerify = () => {
    if (bvn.length === 11 && userType) {
      sessionStorage.setItem("bvn", bvn);
      sessionStorage.setItem("userType", userType);
      openOTPDelivery();
    }
  };

  const handleOTPDeliveryContinue = (method: "phone" | "email") => {
    setDeliveryMethod(method);
    sessionStorage.setItem("otpDeliveryMethod", method);
    closeOTPDelivery();
    openVerifyBVN();
  };

  const handleBVNVerified = (otp: string) => {
    if (userType) {
      closeVerifyBVN();
      console.log("otp", otp);
      router.push(getNextStep(userType, "bvn"));
    }
  };

  if (!userType || userType !== "citizen") {
    return null;
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
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
          disabled={bvn.length !== 11}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
        >
          Verify BVN
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
    </AuthLayout>
  );
}
