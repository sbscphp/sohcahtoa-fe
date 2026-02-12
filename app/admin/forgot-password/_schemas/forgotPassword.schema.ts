import { z } from "zod";

// Email validation schema
export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

// Password creation schema with all requirements
export const createPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must not exceed 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().trim().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreatePasswordFormValues = z.infer<typeof createPasswordSchema>;

// Helper function to check individual password requirements
export const checkPasswordRequirements = (password: string) => {
  return {
    length: password.length >= 8 && password.length <= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};
