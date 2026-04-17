import { z } from "zod";

export const kycBvnSchema = z.string().min(1, "BVN is required").max(100);
export const kycNinRequiredSchema = z.string().min(1, "NIN is required").max(100);
export const kycNinOptionalSchema = z.string().max(100);
