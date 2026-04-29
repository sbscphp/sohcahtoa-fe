import { z } from "zod";

const isRawNin = (value: string) => /^\d+$/.test(value);
const validateRawNinLength = (value: string) => !isRawNin(value) || value.length === 11;
const isRawBvn = (value: string) => /^\d+$/.test(value);
const validateRawBvnLength = (value: string) => !isRawBvn(value) || value.length === 11;

export const kycBvnSchema = z
  .string()
  .min(1, "BVN is required")
  .max(100)
  .refine(validateRawBvnLength, "BVN must be 11 digits");
export const kycNinRequiredSchema = z
  .string()
  .min(1, "NIN is required")
  .max(100)
  .refine(validateRawNinLength, "NIN must be 11 digits");
export const kycNinOptionalSchema = z
  .string()
  .max(100)
  .refine((value) => value.trim() === "" || validateRawNinLength(value), "NIN must be 11 digits");
