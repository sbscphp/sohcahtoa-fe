export const CURRENCIES = [
  { code: "USD", name: "US Dollar", countryCode: "US", symbol: "$" },
  { code: "EUR", name: "Euro", countryCode: "EU", symbol: "€" },
  { code: "GBP", name: "British Pound", countryCode: "GB", symbol: "£" },
  { code: "NGN", name: "Nigerian Naira", countryCode: "NG", symbol: "₦" },
  { code: "JPY", name: "Japanese Yen", countryCode: "JP", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", countryCode: "CA", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", countryCode: "AU", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", countryCode: "CH", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", countryCode: "CN", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", countryCode: "IN", symbol: "₹" },
  { code: "ZAR", name: "South African Rand", countryCode: "ZA", symbol: "R" },
  { code: "BRL", name: "Brazilian Real", countryCode: "BR", symbol: "R$" },
  { code: "GHS", name: "Ghanaian Cedi", countryCode: "GH", symbol: "₵" },
  { code: "KES", name: "Kenyan Shilling", countryCode: "KE", symbol: "KSh" },
  { code: "XOF", name: "West African CFA Franc", countryCode: "SN", symbol: "CFA" },
] as const;

export type Currency = (typeof CURRENCIES)[number];
