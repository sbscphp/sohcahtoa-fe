"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { PasswordInput } from "@/app/(customer)/_components/auth/PasswordInput";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { Button } from "@mantine/core";
import { ArrowUpRight, ArrowLeft, Check, Dot } from "lucide-react";
import { validateUserType, checkAndClearSessionIfUserTypeChanged, clearOnboardingSessionStorage } from "@/app/(customer)/_utils/auth-flow";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";

export default function CreatePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  type CreatePasswordPayload = {
    password: string;
    token: string;
  };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);

  useEffect(() => {
    if (!userType) {
      router.push("/auth/onboarding");
      return;
    }

    checkAndClearSessionIfUserTypeChanged(userType);

    const validationToken = sessionStorage.getItem("validationToken");
    const verificationToken = sessionStorage.getItem("verificationToken");
    
    if (userType === "citizen") {
      if (!validationToken) {
        router.push(`/auth/${userType}/verify-email`);
        return;
      }
    } else {
      // For expatriate/tourist, check for either token
      if (!validationToken && !verificationToken) {
        router.push(`/auth/${userType}/verify-email`);
        return;
      }
    }
  }, [userType, router]);

  const createAccountMutation = useCreateData(
    async ({ password, token }: CreatePasswordPayload) => {
      if (userType === "citizen") {
        return customerApi.auth.nigerian.createAccount({
          password,
          verificationToken: token,
        });
      }

      return customerApi.auth.tourist.createAccount({
        password,
        verificationToken: token,
      });
    }
  );

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

    const validationToken = sessionStorage.getItem("validationToken");
    const verificationToken = sessionStorage.getItem("verificationToken");
    
    let tokenToUse: string | null = null;
    if (userType === "citizen") {
      tokenToUse = validationToken;
    } else {
      tokenToUse = validationToken || verificationToken;
    }
    
    if (!tokenToUse) {
      handleApiError(
        { message: "Validation token not found", status: 400 },
        { customMessage: "Please complete the previous steps first." }
      );
      return;
    }

    setError("");
    setIsCreating(true);
    createAccountMutation.mutate(
      {
        password,
        token: tokenToUse,
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            setIsCreating(false);
            clearOnboardingSessionStorage();
            openSuccess();
          } else {
            setIsCreating(false);
            handleApiError(
              { message: response.error?.message || "Account creation failed", status: 400 },
              { customMessage: response.error?.message || "Failed to create account. Please try again." }
            );
          }
        },
        onError: (error) => {
          setIsCreating(false);
          handleApiError(error);
        },
      }
    );
  };

  const handleSuccessContinue = () => {
    clearOnboardingSessionStorage();
    closeSuccess();
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

  if (!userType) {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push(`/auth/${userType}/verify-email`)}
          className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
        >
          Back
        </Button>
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold mb-2">
            Create Secure Password
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
            password !== confirmPassword ||
            isCreating
          }
          loading={isCreating}
          variant="filled"
          size="lg"
          fullWidth
          radius="xl"
          rightSection={!isCreating && <ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating Account..." : "Create Password"}
        </Button>

        <SecurityBadges />
      </div>

      <SuccessModal
        opened={successOpened}
        onClose={closeSuccess}
        title="Password Created"
        message="Your password has been created successfully."
        buttonText="Continue To Log In"
        onButtonClick={handleSuccessContinue}
      />
    </>
  );
}
