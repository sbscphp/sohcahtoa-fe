"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { PasswordInput } from "@/app/(customer)/_components/auth/PasswordInput";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { Button } from "@mantine/core";
import { ArrowUpRight, Check, Dot } from "lucide-react";

export default function CreateNewPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordResetOpened, { open: openPasswordReset, close: closePasswordReset }] =
    useDisclosure(false);

  useEffect(() => {
    // Check if user came from OTP verification
    const resetEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resetEmail")
        : null;
    
    if (!resetEmail) {
      // Redirect if no email found (user didn't go through the flow)
      router.push("/auth/reset-password");
    }
  }, [router]);

  const validatePassword = (pwd: string) => {
    const hasLength = pwd.length >= 8 && pwd.length <= 12;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);

    return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleCreatePassword = () => {
    if (!validatePassword(password)) {
      setError("Password does not meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    openPasswordReset();
  };

  const handleReturnToLogin = () => {
    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("resetEmail");
    }
    closePasswordReset();
    router.push("/auth/login");
  };

  const passwordRequirements = [
    {
      text: "8-12 characters",
      met: password.length >= 8 && password.length <= 12
    },
    {
      text: "Use both Uppercase letters (A-Z) and Lowercase letter (a-z).",
      met: /[A-Z]/.test(password) && /[a-z]/.test(password)
    },
    { text: "Include Numbers (0-9)", met: /[0-9]/.test(password) },
    {
      text: "Special characters (e.g. ! @ # $ % ^ & *)",
      met: /[!@#$%^&*]/.test(password)
    }
  ];

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold mb-2">
            Create New Password
          </h1>
          <p className="text-body-text-100 text-base">
            This password will be used every time you sign in. Make sure
            it&apos;s unique and secure for you.
          </p>
        </div>

        <div className="space-y-6">
          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            size="lg"
            error={error && !validatePassword(password) ? error : undefined}
          />

          <div className="">
            <ul className="space-y-1">
              {passwordRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span
                    className={req.met ? "text-success-500" : "text-text-300"}
                  >
                    {req.met ? <Check size={18} /> : <Dot size={18} />}
                  </span>
                  <span
                    className={`text-sm ${
                      req.met ? "text-text-400" : "text-text-300"
                    }`}
                  >
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Enter password"
            size="lg"
            error={
              password && confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />
        </div>

        <Button
          onClick={handleCreatePassword}
          disabled={
            !password ||
            !confirmPassword ||
            !validatePassword(password) ||
            password !== confirmPassword
          }
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Create Password
        </Button>

        <SecurityBadges />
      </div>

      <SuccessModal
        opened={passwordResetOpened}
        onClose={closePasswordReset}
        title="Password Reset"
        message="Your password has been reset successfully."
        buttonText="Return To Log In"
        onButtonClick={handleReturnToLogin}
      />
    </>
  );
}
