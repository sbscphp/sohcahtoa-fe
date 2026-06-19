/** `purpose` values sent to the backend on transaction create (Buy FX). */
export const CUSTOMER_BUY_FX_API_PURPOSE = {
  PTA: "Personal Travel Allowance",
  BTA: "Business Travel Allowance",
  MEDICAL: "Medical Fee Payment",
  PROFESSIONAL_BODY: "Professional Fees Payment",
  SCHOOL_FEES: "Pay School Fees",
  TOURIST_FX: "I am Touring Nigeria",
} as const;

/** `purpose` values sent to the backend on transaction create (Sell FX). */
export const CUSTOMER_SELL_FX_API_PURPOSE = {
  EXPATRIATE_FX: "I am a foreigner living or working in Nigeria(Expatriate)",
  RESIDENT_FX: "I have FX and want Naira(resident)",
  TOURIST_FX: "I am touring Nigeria and want Naira(Tourist)",
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
