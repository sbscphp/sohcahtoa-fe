"use client";

import {
  passwordLengthOk,
  passwordNumberOk,
  passwordSpecialOk,
  passwordUpperLowerOk,
} from "@/app/_lib/password-policy";

interface PasswordRequirementsProps {
  password: string;
  showAll?: boolean;
}

export function PasswordRequirements({ password, showAll = false }: PasswordRequirementsProps) {
  const requirements = [
    {
      text: "At least 8 characters",
      met: passwordLengthOk(password),
    },
    {
      text: "Use both Uppercase letters (A-Z) and Lowercase letter (a-z).",
      met: passwordUpperLowerOk(password),
    },
    {
      text: "Include Numbers (0-9)",
      met: passwordNumberOk(password),
    },
    {
      text: "At least one symbol (e.g. ! ? @ # $ % ^ & * ( ) _ +)",
      met: passwordSpecialOk(password),
    },
  ];

  return (
    <div className="space-y-2 mt-2">
      {requirements.map((req, index) => (
        <div
          key={index}
          className={`text-sm flex items-start gap-2 ${
            showAll || req.met
              ? req.met
                ? "text-green-600"
                : "text-body-text-100"
              : "text-body-text-100"
          }`}
        >
          <span className={req.met ? "text-green-600" : "text-body-text-100"}>
            {req.met ? "✓" : "•"}
          </span>
          <span>{req.text}</span>
        </div>
      ))}
    </div>
  );
}
