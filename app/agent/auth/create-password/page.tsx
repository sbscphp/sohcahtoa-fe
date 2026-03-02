"use client";

import { useState } from "react";
import { PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { AgentAuthLayout } from "@/app/agent/_components/auth/AuthLayout";
import { PasswordRequirements } from "@/app/agent/_components/auth/PasswordRequirements";
import { PasswordCreatedModal } from "@/app/agent/_components/auth/PasswordCreatedModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must be at most 12 characters")
      .regex(/[a-z]/, "Password must contain lowercase letters")
      .regex(/[A-Z]/, "Password must contain uppercase letters")
      .regex(/\d/, "Password must contain numbers")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain special characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function CreatePasswordPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const form = useForm<PasswordFormValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(passwordSchema),
    validateInputOnChange: true,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    // Mock API call - replace with actual API
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Password creation failed", error);
    }
  });

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push("/agent/auth/login");
  };

  return (
    <>
      <AgentAuthLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
              Create password
            </h1>
            <p className="text-body-text-100 text-base">
              This password will be used every time you sign in as an Agent. Make sure it's unique and secure for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Password
              </label>
              <PasswordInput
                placeholder="Enter password"
                size="lg"
                {...form.getInputProps("password")}
                onFocus={() => setShowRequirements(true)}
              />
              {showRequirements && (
                <PasswordRequirements password={form.values.password} showAll />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Confirm password
              </label>
              <PasswordInput
                placeholder="Enter password"
                size="lg"
                {...form.getInputProps("confirmPassword")}
              />
            </div>

            <CustomButton
              buttonType="primary"
              type="submit"
              size="lg"
              radius="xl"
              fullWidth
              disabled={!form.isValid()}
              className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
            >
              Log In →
            </CustomButton>
          </form>
        </div>
      </AgentAuthLayout>

      <PasswordCreatedModal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
      />
    </>
  );
}
