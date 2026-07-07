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
const correspondenceSwiftOptional = z.string().trim();

function validateSwiftWhenPresent(swift: string, path: string, ctx: z.RefinementCtx) {
  if (!swift) return;
  if (swift.length < 8 || swift.length > 11) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: "SWIFT / BIC must be 8–11 characters when provided",
    });
  } else if (!/^[A-Za-z0-9]+$/.test(swift)) {
    ctx.addIssue({
      code: "custom",
      path: [path],
      message: "SWIFT / BIC must be alphanumeric",
    });
  }
}

export const internationalBankDetailsBaseSchema = z.object({
  beneficiaryCountryRegion: z.enum(["UK", "US_CA", "IN", "AU", "NG", "OTHER"]),
  organizationName: z.string().trim().min(1, "Name of organization is required"),
  beneficiaryPhone: z.string().trim().min(1, "Phone number is required"),
  beneficiaryEmail: z.string().trim().email("Enter a valid email address"),
  beneficiaryAddress: z.string().trim().min(1, "Address is required"),
  beneficiaryCity: z.string().trim().min(1, "City is required"),
  beneficiaryState: z.string().trim().min(1, "State is required"),
  beneficiaryCountry: z.string().trim().min(1, "Country is required"),
  bankName: z.string().trim().min(1, "Bank name is required"),
  accountName: z.string().trim().min(1, "Account name is required"),
  bankAddress: z.string().trim().min(1, "Bank account address is required"),
  accountNumber: z
    .string()
    .trim()
    .min(1, "Bank account number is required")
    .max(34, "Bank account number is too long"),
  iban: z.string(),
  swiftCode: swiftOptional,
  correspondenceBankName: z.string().trim(),
  correspondenceBankAddress: z.string().trim(),
  correspondenceBankSwiftCode: correspondenceSwiftOptional,
  paymentReference: z.string().trim(),
  routingNumber: z.string(),
  ifscNumber: z.string(),
  purposeCode: z.string(),
  bsbCode: z.string(),
  /** @deprecated Legacy field — migrated from bankAccountName in initialValues */
  bankAccountName: z.string().trim().optional(),
  /** @deprecated Alias — mapped from organizationName in payload */
  beneficiaryName: z.string().trim().optional(),
  otherInformation: z.string().trim().max(2000),
});

export type InternationalBankDetailsBaseValues = z.infer<typeof internationalBankDetailsBaseSchema>;

export function refineInternationalBankDetails(
  data: InternationalBankDetailsBaseValues,
  ctx: z.RefinementCtx,
): void {
  const need = (path: keyof InternationalBankDetailsBaseValues, message: string, raw: string) => {
    if (!raw.trim()) {
      ctx.addIssue({ code: "custom", path: [path as string], message });
    }
  };

  validateSwiftWhenPresent(data.swiftCode.trim(), "swiftCode", ctx);
  validateSwiftWhenPresent(
    data.correspondenceBankSwiftCode.trim(),
    "correspondenceBankSwiftCode",
    ctx,
  );

  const region = data.beneficiaryCountryRegion;

  const paymentRequired = region !== "NG";
  if (paymentRequired) {
    need("paymentReference", "Payment reference / ID is required", data.paymentReference);
  }

  switch (region) {
    case "UK": {
      const iban = data.iban.replaceAll(/\s/g, "").trim();
      if (!iban) {
        ctx.addIssue({
          code: "custom",
          path: ["iban"],
          message: "Bank account IBAN is required for United Kingdom",
        });
      } else if (iban.length < 15 || iban.length > 34) {
        ctx.addIssue({
          code: "custom",
          path: ["iban"],
          message: "Enter a valid IBAN",
        });
      }
      need("swiftCode", "Bank account SWIFT / BIC is required for United Kingdom", data.swiftCode);
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
      need("swiftCode", "Bank account SWIFT / BIC is required", data.swiftCode);
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
      need("swiftCode", "Bank account SWIFT / BIC is required for India", data.swiftCode);
      break;
    }
    case "AU":
      need("bsbCode", "BSB code is required for Australia", data.bsbCode);
      need("swiftCode", "Bank account SWIFT / BIC is required for Australia", data.swiftCode);
      break;
    case "NG":
      break;
    case "OTHER":
      break;
  }
}

export const internationalBankDetailsSchema = internationalBankDetailsBaseSchema.superRefine(
  refineInternationalBankDetails,
);

export type InternationalBankDetailsFormValues = z.infer<typeof internationalBankDetailsSchema>;

export type InternationalBankDetailsLegacyInitial = Partial<InternationalBankDetailsFormValues> & {
  accountName?: string;
  beneficiaryName?: string;
};

/** Maps legacy bank step fields and defaults empty region-specific strings. */
export function internationalBankDetailsInitialValues(
  initial?: InternationalBankDetailsLegacyInitial
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

  const organizationName = (
    initial?.organizationName ??
    initial?.beneficiaryName ??
    ""
  ).trim();

  const bankName = (initial?.bankName ?? initial?.bankAccountName ?? "").trim();
  const accountName = (initial?.accountName ?? "").trim();

  return {
    beneficiaryCountryRegion: inferredRegion,
    organizationName,
    beneficiaryPhone: (initial?.beneficiaryPhone ?? "").trim(),
    beneficiaryEmail: (initial?.beneficiaryEmail ?? "").trim(),
    beneficiaryAddress: (initial?.beneficiaryAddress ?? "").trim(),
    beneficiaryCity: (initial?.beneficiaryCity ?? "").trim(),
    beneficiaryState: (initial?.beneficiaryState ?? "").trim(),
    beneficiaryCountry: (initial?.beneficiaryCountry ?? "").trim(),
    bankName,
    accountName,
    bankAddress: (initial?.bankAddress ?? "").trim(),
    accountNumber: (initial?.accountNumber ?? "").trim(),
    paymentReference: (initial?.paymentReference ?? "").trim(),
    swiftCode: (initial?.swiftCode ?? "").trim().toUpperCase(),
    iban: (initial?.iban ?? "").trim().toUpperCase(),
    routingNumber: (initial?.routingNumber ?? "").trim(),
    ifscNumber: (initial?.ifscNumber ?? "").trim().toUpperCase(),
    purposeCode: (initial?.purposeCode ?? "").trim(),
    bsbCode: (initial?.bsbCode ?? "").trim(),
    correspondenceBankName: (initial?.correspondenceBankName ?? "").trim(),
    correspondenceBankAddress: (initial?.correspondenceBankAddress ?? "").trim(),
    correspondenceBankSwiftCode: (initial?.correspondenceBankSwiftCode ?? "")
      .trim()
      .toUpperCase(),
    bankAccountName: bankName,
    beneficiaryName: organizationName,
    otherInformation: (initial?.otherInformation ?? "").trim(),
  };
}
