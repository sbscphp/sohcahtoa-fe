"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PinInput, Text, Title } from "@mantine/core";
import { AgentAuthLayout } from "@/app/agent/_components/auth/AuthLayout";
import { CustomButton } from "@/app/admin/_components/CustomButton";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const canSubmit = otp.length === 6 && !loading;

  const handleOtpSubmit = async () => {
    if (!canSubmit) return;
    
    setLoading(true);
    try {
      // Mock OTP verification - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // On success, redirect to create password
      router.push("/agent/auth/create-password");
    } catch (error) {
      console.error("OTP verification failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Mock resend OTP - replace with actual API call
    setOtp("");
    setTimeLeft(900); // Reset timer
    console.log("Resending OTP...");
  };

  return (
    <AgentAuthLayout>
      <div className="space-y-8">
        <div>
          <Title order={2} className="text-body-heading-200 text-3xl font-semibold mb-2">
            Account Authorisation Access
          </Title>
          <Text className="text-body-text-100 text-base">
            A six (6) digit OTP has been sent to your email linked to this account. e*****sohcahtoa.com. Enter code to log in
          </Text>
        </div>

        <div className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <PinInput
              length={6}
              size="lg"
              value={otp}
              onChange={setOtp}
              oneTimeCode
              type="number"
              className="gap-3"
            />
          </div>

          {/* Timer and Resend */}
          <div className="flex flex-col gap-3 items-center">
            <Text className="text-body-text-100 text-sm">
              OTP expires in{" "}
              <span className="text-error-600 font-semibold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </Text>

            <Text className="text-body-text-100 text-sm">
              Didn&apos;t Receive Code?{" "}
              <span
                role="button"
                tabIndex={0}
                onClick={timeLeft > 0 ? undefined : handleResendOtp}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (timeLeft === 0) handleResendOtp();
                  }
                }}
                className={
                  timeLeft > 0
                    ? "text-error-600/60 cursor-not-allowed"
                    : "text-error-600 cursor-pointer font-medium underline"
                }
                aria-disabled={timeLeft > 0}
              >
                Resend OTP
              </span>
            </Text>
          </div>

          {/* Validate Button */}
          <CustomButton
            buttonType="primary"
            type="button"
            size="lg"
            radius="xl"
            fullWidth
            loading={loading}
            disabled={!canSubmit}
            onClick={handleOtpSubmit}
            className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          >
            Validate →
          </CustomButton>
        </div>
      </div>
    </AgentAuthLayout>
  );
}
