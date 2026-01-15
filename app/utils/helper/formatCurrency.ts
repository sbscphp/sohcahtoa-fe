export const formatCurrency = (amount?: number | string) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0, // no decimals if whole number
    maximumFractionDigits: 2, // allow up to 2 decimals
  }).format(Number(amount));
};