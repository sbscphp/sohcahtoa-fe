export interface Currency {
  code?: string;
  name?: string;
  countryCode?: string;
  symbol?: string;
  rate?: number;
}

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", countryCode: "US", symbol: "$", rate: 1 },
  { code: "EUR", name: "Euro", countryCode: "EU", symbol: "€", rate: 1.1 },
  { code: "GBP", name: "British Pound", countryCode: "GB", symbol: "£", rate: 1.2 },
  { code: "NGN", name: "Nigerian Naira", countryCode: "NG", symbol: "₦", rate: 1.3 },
  { code: "JPY", name: "Japanese Yen", countryCode: "JP", symbol: "¥", rate: 1.3 },
  { code: "CAD", name: "Canadian Dollar", countryCode: "CA", symbol: "C$", rate: 1.4 },
  { code: "AUD", name: "Australian Dollar", countryCode: "AU", symbol: "A$", rate: 1.5 },
  { code: "CHF", name: "Swiss Franc", countryCode: "CH", symbol: "CHF", rate: 1.6 },
  { code: "CNY", name: "Chinese Yuan", countryCode: "CN", symbol: "¥", rate: 1.7 },
  { code: "INR", name: "Indian Rupee", countryCode: "IN", symbol: "₹", rate: 1.8 },
  { code: "ZAR", name: "South African Rand", countryCode: "ZA", symbol: "R", rate: 1.8 },
  { code: "BRL", name: "Brazilian Real", countryCode: "BR", symbol: "R$", rate: 1.9 },
  { code: "GHS", name: "Ghanaian Cedi", countryCode: "GH", symbol: "₵", rate: 1.9 },
  { code: "KES", name: "Kenyan Shilling", countryCode: "KE", symbol: "KSh", rate: 2.0 },
  { code: "XOF", name: "West African CFA Franc", countryCode: "SN", symbol: "CFA", rate: 2.1 },
] as const;