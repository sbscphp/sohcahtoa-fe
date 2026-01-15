"use client";

import { useState } from "react";
import {
  Button,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Paper,
  Stack,
  Group,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { loginSchema, LoginFormValues } from "./_schemas/login.schema";
import { useLogin } from "./hooks/useLogin";
import { useVerifyOtp } from "./hooks/useVerifyOtp";

import { AuthSlideshow } from "./AuthSlideshow";
import { OtpVerification } from "./OtpVerification";
import { OtpSuccess } from "./OtpSuccess";

import Logo from "../_components/assets/logo.png";

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "otp" | "success">("login");
  const [emailForOtp, setEmailForOtp] = useState("");

  const loginMutation = useLogin({
    onSuccess: (data, variables) => {
      if (data.requiresOtp) {
        setEmailForOtp(variables.email);
        setStep("otp");
      }
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: () => {
      setStep("success");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1.6fr_2fr] bg-white rounded-xl overflow-hidden shadow-lg">

        {/* LEFT SECTION */}
        <div className="hidden lg:flex flex-col justify-between bg-[#F3F3F3] p-10">
          <div>
            <Image src={Logo} alt="Logo" className="h-8 mb-10" />

            <Title order={2}>
              Welcome to the <br /> Back-Office Portal
            </Title>

            <Text c="dimmed" mt="sm" size="sm" maw={380}>
              Your central workspace for settlement control, rate
              configuration, and franchise oversight — all in one
              dependable place.
            </Text>
          </div>

          <AuthSlideshow />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-center p-8">
          {step === "login" && (
            <Paper w="100%" maw={420} radius="md" p="xl">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack>
                  <div>
                    <Title order={3}>Log In</Title>
                    <Text size="sm" c="dimmed">
                      A central workspace for everything FX
                    </Text>
                  </div>

                  <TextInput
                    label="Email Address"
                    placeholder="Enter email address"
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter password"
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  <Group justify="flex-end">
                    <Text size="xs" c="orange">
                      Forgot Password?
                    </Text>
                  </Group>

                  <Button
                    type="submit"
                    size="md"
                    radius="xl"
                    color="orange"
                    fullWidth
                    loading={loginMutation.isPending}
                    disabled={!isValid || loginMutation.isPending}
                  >
                    Log In →
                  </Button>
                </Stack>
              </form>
            </Paper>
          )}

          {step === "otp" && (
            <OtpVerification
              email={emailForOtp}
              loading={verifyOtp.isPending}
              onVerify={(otp) => verifyOtp.mutate(otp)}
              onResend={() => console.log("Resend OTP")}
            />
          )}

          {step === "success" && <OtpSuccess />}
        </div>
      </div>
    </div>
  );
}
