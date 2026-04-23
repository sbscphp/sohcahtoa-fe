import { z } from "zod";

export type BeneficiaryBankRegion = "UK" | "US_CA" | "IN" | "AU" | "NG" | "OTHER";

export const BENEFICIARY_REGION_OPTIONS: { value: BeneficiaryBankRegion; label: string }[] = [
  { value: "UK", label: "United Kingdom" },
  { value: "US_CA", label: "United States & Canada" },
  { value: "IN", label: "India" },
  { value: "AU", label: "Australia" },
  { value: "NG", label: "Nigeria" },
  { value: "OTHER", label: "Other" },
];

const swiftOptional = z.string().trim();

export const internationalBankDetailsSchema = z
  .object({
    beneficiaryCountryRegion: z.enum(["UK", "US_CA", "IN", "AU", "NG", "OTHER"]),
    beneficiaryName: z.string().trim().min(1, "Beneficiary name is required"),
    beneficiaryAddress: z.string().trim().min(1, "Beneficiary address is required"),
    bankName: z.string().trim().min(1, "Bank name is required"),
    bankAddress: z.string().trim().min(1, "Bank address is required"),
    accountNumber: z.string().trim().min(1, "Account number is required"),
    swiftCode: swiftOptional,
    iban: z.string(),
    routingNumber: z.string(),
    ifscNumber: z.string(),
    purposeCode: z.string(),
    bsbCode: z.string(),
  })
  .superRefine((data, ctx) => {
    const need = (path: keyof typeof data, message: string, raw: string) => {
      if (!raw.trim()) {
        ctx.addIssue({ code: "custom", path: [path as string], message });
      }
    };

    const swift = data.swiftCode.trim();
    if (swift) {
      if (swift.length < 8 || swift.length > 11) {
        ctx.addIssue({
          code: "custom",
          path: ["swiftCode"],
          message: "SWIFT / BIC must be 8–11 characters when provided",
        });
      } else if (!/^[A-Za-z0-9]+$/.test(swift)) {
        ctx.addIssue({
          code: "custom",
          path: ["swiftCode"],
          message: "SWIFT / BIC must be alphanumeric",
        });
      }
    }

    switch (data.beneficiaryCountryRegion) {
      case "UK": {
        const iban = data.iban.replaceAll(/\s/g, "").trim();
        if (!iban) {
          ctx.addIssue({
            code: "custom",
            path: ["iban"],
            message: "IBAN is required for United Kingdom",
          });
        } else if (iban.length < 15 || iban.length > 34) {
          ctx.addIssue({
            code: "custom",
            path: ["iban"],
            message: "Enter a valid IBAN",
          });
        }
        break;
      }
      case "US_CA": {
        const r = data.routingNumber.replaceAll(/\D/g, "");
        if (r.length !== 9) {
          ctx.addIssue({
            code: "custom",
            path: ["routingNumber"],
            message: "Routing number must be 9 digits",
          });
        }
        break;
      }
      case "IN": {
        need("ifscNumber", "IFSC number is required for India", data.ifscNumber);
        const ifsc = data.ifscNumber.replaceAll(/[^A-Za-z0-9]/g, "");
        if (ifsc.length > 0 && ifsc.length !== 11) {
          ctx.addIssue({
            code: "custom",
            path: ["ifscNumber"],
            message: "IFSC must be 11 characters",
          });
        }
        need("purposeCode", "Purpose code is required for India", data.purposeCode);
        break;
      }
      case "AU":
        need("bsbCode", "BSB code is required for Australia", data.bsbCode);
        break;
      case "NG":
      case "OTHER":
        break;
    }
  });

export type InternationalBankDetailsFormValues = z.infer<typeof internationalBankDetailsSchema>;

/** Maps legacy bank step fields and defaults empty region-specific strings. */
export function internationalBankDetailsInitialValues(
  initial?: Partial<InternationalBankDetailsFormValues> & {
    accountName?: string;
  }
): InternationalBankDetailsFormValues {
  let inferredRegion: BeneficiaryBankRegion = "OTHER";
  if (initial?.beneficiaryCountryRegion) {
    inferredRegion = initial.beneficiaryCountryRegion;
  } else if ((initial?.iban ?? "").replaceAll(/\s/g, "").trim()) {
    inferredRegion = "UK";
  } else if ((initial?.routingNumber ?? "").trim()) {
    inferredRegion = "US_CA";
  } else if ((initial?.ifscNumber ?? "").trim() || (initial?.purposeCode ?? "").trim()) {
    inferredRegion = "IN";
  } else if ((initial?.bsbCode ?? "").trim()) {
    inferredRegion = "AU";
  }

  return {
    beneficiaryCountryRegion: inferredRegion,
    beneficiaryName: (initial?.beneficiaryName ?? initial?.accountName ?? "").trim(),
    beneficiaryAddress: (initial?.beneficiaryAddress ?? "").trim(),
    bankName: (initial?.bankName ?? "").trim(),
    bankAddress: (initial?.bankAddress ?? "").trim(),
    accountNumber: (initial?.accountNumber ?? "").trim(),
    swiftCode: (initial?.swiftCode ?? "").trim().toUpperCase(),
    iban: (initial?.iban ?? "").trim().toUpperCase(),
    routingNumber: (initial?.routingNumber ?? "").trim(),
    ifscNumber: (initial?.ifscNumber ?? "").trim().toUpperCase(),
    purposeCode: (initial?.purposeCode ?? "").trim(),
    bsbCode: (initial?.bsbCode ?? "").trim(),
  };
}
