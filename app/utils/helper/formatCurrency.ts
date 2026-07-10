export const formatCurrency = (amount?: number | string, currency?: string) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    // minimumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};