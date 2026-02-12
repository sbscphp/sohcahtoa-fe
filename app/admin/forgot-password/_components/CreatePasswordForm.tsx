"use client";

import { useState } from "react";
import { PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { CustomButton } from "@/app/admin/_components/CustomButton";
import {
  createPasswordSchema,
  checkPasswordRequirements,
  type CreatePasswordFormValues,
} from "../_schemas/forgotPassword.schema";

interface CreatePasswordFormProps {
  onSubmit: (values: CreatePasswordFormValues) => void;
  isLoading?: boolean;
}

export function CreatePasswordForm({
  onSubmit,
  isLoading = false,
}: CreatePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");

  const form = useForm<CreatePasswordFormValues>({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(createPasswordSchema),
    validateInputOnChange: true,
  });

  const handleSubmit = form.onSubmit(onSubmit);

  // Get password requirements for validation indicators
  const passwordRequirements = checkPasswordRequirements(currentPassword);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
          Create New Password
        </h1>
        <p className="text-body-text-100 text-base">
          This password will be used every time you sign in. Make sure it&apos;s
          unique and secure for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-heading-200 text-sm font-medium">
            Password
          </label>
          <PasswordInput
            key={form.key("password")}
            placeholder="Enter password"
            size="lg"
            {...form.getInputProps("password")}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              form.getInputProps("password").onChange(e);
            }}
          />

          {/* Password requirements indicators */}
          <div className="space-y-1 mt-3">
            <div
              className={`text-xs ${
                passwordRequirements.length
                  ? "text-success-600"
                  : "text-body-text-100"
              }`}
            >
              {passwordRequirements.length ? "✓" : "•"} 8–12 characters
            </div>
            <div
              className={`text-xs ${
                passwordRequirements.uppercase && passwordRequirements.lowercase
                  ? "text-success-600"
                  : "text-body-text-100"
              }`}
            >
              {passwordRequirements.uppercase && passwordRequirements.lowercase
                ? "✓"
                : "•"}{" "}
              Use both Uppercase letters [A-Z] and Lowercase letter [a-z]
            </div>
            <div
              className={`text-xs ${
                passwordRequirements.number
                  ? "text-success-600"
                  : "text-body-text-100"
              }`}
            >
              {passwordRequirements.number ? "✓" : "•"} Include Numbers (0–9)
            </div>
            <div
              className={`text-xs ${
                passwordRequirements.special
                  ? "text-success-600"
                  : "text-body-text-100"
              }`}
            >
              {passwordRequirements.special ? "✓" : "•"} Special characters
              [e.g. ! @ # $ % * & *]
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-heading-200 text-sm font-medium">
            Confirm Password
          </label>
          <PasswordInput
            key={form.key("confirmPassword")}
            placeholder="Re-enter password"
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
          loading={isLoading}
          disabled={!form.isValid() || isLoading}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Create Password →
        </CustomButton>
      </form>
    </div>
  );
}
