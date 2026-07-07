/** `purpose` values sent to the backend on transaction create (Buy FX). */
export const CUSTOMER_BUY_FX_API_PURPOSE = {
  PTA: "Personal Travel Allowance",
  BTA: "Business Travel Allowance",
  MEDICAL: "Pay Medical Fees",
  PROFESSIONAL_BODY: "Professional Fees Payment",
  SCHOOL_FEES: "Pay School Fees",
  TOURIST_FX: "I am Touring Nigeria",
} as const;

/** `purpose` values sent to the backend on transaction create (Sell FX). */
export const CUSTOMER_SELL_FX_API_PURPOSE = {
  RESIDENT_FX: "Resident Selling FX",
  TOURIST_FX: "Tourist Selling FX",
  EXPATRIATE_FX: "Expatriate Selling FX",
} as const;

type BuyFxApiType = keyof typeof CUSTOMER_BUY_FX_API_PURPOSE;
type SellFxApiType = keyof typeof CUSTOMER_SELL_FX_API_PURPOSE;

export function getCustomerFxPurposeForPayload(
  apiType: string,
  mode: "BUY" | "SELL"
): string {
  if (mode === "SELL" && apiType in CUSTOMER_SELL_FX_API_PURPOSE) {
    return CUSTOMER_SELL_FX_API_PURPOSE[apiType as SellFxApiType];
  }

  if (apiType in CUSTOMER_BUY_FX_API_PURPOSE) {
    return CUSTOMER_BUY_FX_API_PURPOSE[apiType as BuyFxApiType];
  }

  if (apiType in CUSTOMER_SELL_FX_API_PURPOSE) {
    return CUSTOMER_SELL_FX_API_PURPOSE[apiType as SellFxApiType];
  }

  return "Transaction";
}
