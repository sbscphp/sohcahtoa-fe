/**
 * API Types based on Swagger/OpenAPI documentation
 * These types match the API endpoints and payloads
 */

// ==================== Auth Types ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface VerifyBvnRequest {
  bvn: string;
}

export interface VerifyBvnResponse {
  verified: boolean;
  data?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
  };
}

export interface SendOtpRequest {
  bvn?: string;
  passportNumber?: string;
  verificationType: "phone" | "email";
  phoneNumber?: string;
  email?: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
}

export interface ValidateOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface ValidateOtpResponse {
  verified: boolean;
  token?: string;
}

export interface CreateNigerianAccountRequest {
  bvn: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  // ... other fields from BVN verification
}

export interface CreateTouristAccountRequest {
  passportNumber: string;
  passportDocumentUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // ... other fields
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ==================== Transaction Types ====================

export interface CreateTransactionRequest {
  type: "PTA" | "BTA" | "Medical" | "School Fees" | "Professional Body Fee" | "Tourist" | "IMTO";
  amount: number;
  currency: string;
  purpose: string;
  beneficiaryDetails: Record<string, unknown>;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "REQUEST_MORE_INFO";
  stage: string;
  date: string;
  transaction_type: "Buy FX" | "Sell FX" | "Receive FX";
}

export interface TransactionDetail extends Transaction {
  transactionDetails?: {
    transactionId: string;
    amount: { code: string; formatted: string };
    equivalentAmount: { code: string; formatted: string };
    dateInitiated: string;
    pickupAddress?: string;
  };
  paymentDetails?: {
    transactionId: string;
    transactionDate: string;
    transactionTime: string;
    transactionReceipt: { filename: string };
    paidTo: string;
  };
  settlement?: {
    settlementId: string;
    settlementDate: string;
    settlementTime: string;
    settlementReceipt: { filename: string };
    settlementStructureCash: string;
    settlementStructurePrepaidCard: string;
    paidInto: string;
    settlementStatus: string;
  };
  requiredDocuments?: {
    bvn?: string;
    tin?: string;
    formAId?: string;
    formA?: { filename: string };
    utilityBill?: { filename: string };
    visa?: { filename: string };
    returnTicket?: { filename: string };
  };
}

export interface TransactionsListResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateTransactionRequest {
  amount?: number;
  purpose?: string;
  beneficiaryDetails?: Record<string, unknown>;
}

export interface CheckTransactionLimitsRequest {
  type: string;
  amount: number;
}

export interface CheckTransactionLimitsResponse {
  allowed: boolean;
  reason?: string;
  remainingLimit?: number;
}

// ==================== Payment Types ====================

export interface InitializePaymentRequest {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: "BANK_TRANSFER" | "CARD" | "OTHER";
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName?: string;
  };
}

export interface InitializePaymentResponse {
  paymentReference: string;
  paymentUrl?: string;
  expiresAt: string;
}

export interface PaymentCallbackRequest {
  transactionId: string;
  paymentReference: string;
  proofOfPayment: string;
}

export interface ExchangeRateRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface ExchangeRateResponse {
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  validUntil: string;
}

export interface DepositInitiateRequest {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  bankDetails: Record<string, unknown>;
}

export interface DepositConfirmRequest {
  transactionId: string;
  paymentReference: string;
  proofOfPayment: string;
}

// ==================== KYC Types ====================

export interface VerifyKycRequest {
  documentType: "BVN" | "PASSPORT" | "NIN";
  documentNumber: string;
}

export interface UploadPassportRequest {
  passportFile: File;
}

export interface PassportStatusResponse {
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string;
  rejectionReason?: string;
}

// ==================== Common Types ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}
