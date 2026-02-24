"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, TextInput } from "@mantine/core";

const SECURITY_QUESTIONS = [
  "What is your favorite food?",
  "What city were you born in?",
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite movie?",
];

export default function VerifySecurityQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<string | null>("What is your favorite food?");
  const [answer, setAnswer] = useState("");

  const handleContinue = () => {
    if (question && answer.trim()) {
      // TODO: API verify security question, then redirect to change password
      router.push("/agent/settings/change-password");
    }
  };

  const isValid = question && answer.trim().length > 0;

  const inputClassNames = {
    label: "text-sm font-medium leading-5 text-[#6C6969]",
    input:
      "!h-14 !rounded-lg !border-[#CCCACA] !px-3.5 !py-4 !text-base !leading-6 !text-[#1F1E1E] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] placeholder:!text-[#667085]",
  };

  return (
    <div
      className="flex flex-col gap-8 rounded-xl border bg-white p-8 max-w-[800px] mx-auto"
      style={{
        borderColor: "#F2F4F7",
      }}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-2xl font-semibold leading-8 tracking-[-0.032em] text-[#323131]">
          Security Verification
        </h2>
        <p className="text-lg font-normal leading-[26px] text-[#6C6969]">
          Please answer your security question to continue.
        </p>
      </div>

      <div className="flex flex-col justify-center gap-6">
        <div className="flex flex-col gap-6">
          <Select
            label="Question *"
            placeholder="Select a question"
            data={SECURITY_QUESTIONS}
            value={question}
            onChange={setQuestion}
            size="lg"
            classNames={inputClassNames}
          />

          <TextInput
            label="Input Answer *"
            placeholder="Input answer"
            value={answer}
            onChange={(e) => setAnswer(e.currentTarget.value)}
            size="lg"
            classNames={inputClassNames}
          />
        </div>

        <div className="flex flex-row flex-wrap items-start gap-6">
          <Button
            variant="default"
            className="!h-[52px] !min-w-[188px] !rounded-full !border-[#CCCACA] !bg-white !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#4D4B4B] hover:!bg-gray-50"
            onClick={() => router.push("/agent/settings/account-security")}
          >
            Cancel
          </Button>
          <Button
            className="!h-[52px] !min-w-[188px] !rounded-full !bg-primary-400 !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#FFF6F1] hover:!bg-primary-500 disabled:!opacity-20"
            disabled={!isValid}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
