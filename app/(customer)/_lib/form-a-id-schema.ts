import { z } from "zod";

/** Form A ID: alphanumeric (A–Z, a–z, 0–9), max 10 characters. */
export const formAIdSchema = z
  .string()
  .min(1, "Form A ID is required")
  .max(10, "Form A ID must be at most 10 characters")
  .regex(/^[a-zA-Z0-9]+$/, "Form A ID must contain only letters and numbers");
