"use client";

interface PasswordRequirementsProps {
  password: string;
  showAll?: boolean;
}

export function PasswordRequirements({ password, showAll = false }: PasswordRequirementsProps) {
  const requirements = [
    {
      text: "8-12 characters",
      met: password.length >= 8 && password.length <= 12,
    },
    {
      text: "Use both Uppercase letters (A-Z) and Lowercase letter (a-z).",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      text: "Include Numbers (0-9)",
      met: /\d/.test(password),
    },
    {
      text: "Special characters (e.g. ! @ # $ % ^ & *)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
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
