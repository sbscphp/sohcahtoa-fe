"use client";

import { useState, useEffect } from "react";
import { PinInput } from "@mantine/core";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  expiryMinutes?: number;
  onResend?: () => void;
  maskedInfo?: string;
}

export function OTPInput({
  length = 6,
  onComplete,
  expiryMinutes = 15,
  onResend,
  maskedInfo
}: OTPInputProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(expiryMinutes * 60);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleComplete = (value: string) => {
    setOtp(value);
    onComplete(value);
  };

  const handleResendClick = () => {
    setOtp("");
    if (onResend) {
      onResend();
    }
  };

  return (
    <div className="space-y-5">
      {maskedInfo && (
        <p className="text-body-text-100 text-base">{maskedInfo}</p>
      )}

      <div className="flex justify-center">
        <PinInput
          length={length}
          value={otp}
          onChange={setOtp}
          onComplete={handleComplete}
          type="number"
          size="xl"
          placeholder=""
          styles={{
            input: {
              fontSize: "var(--font-size-4xl)",
              fontWeight: 600,
              color: "var(--color-body-text-300)",
              backgroundColor: "#F9F9F9",
              borderColor: "#CCCACA"
            }
          }}
        />
      </div>

      <div className="text-center space-y-2">
        <p className="text-text-300 text-sm">
          OTP expires in{" "}
          <span className="text-error-500 font-semibold">
            {formatTime(timeLeft)}
          </span>
        </p>

        {onResend && (
          <p className="text-body-text-100 text-sm">
            Didn&apos;t Receive Code?{" "}
            <button
              onClick={handleResendClick}
              disabled={timeLeft > 0}
              className="text-error-500 text-sm font-semibold! underline cursor-pointer transition-all duration-300"
            >
              Resend OTP
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
