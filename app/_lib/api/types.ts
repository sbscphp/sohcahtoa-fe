/**
 * API Types based on Swagger/OpenAPI documentation
 * These types match the API endpoints and payloads
 */

export interface ApiResponseWrapper<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// ==================== Auth Types ====================

export interface LoginRequest {
  email: string;
  password: string;
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

export interface VerifyBvnResponseData {
  verificationToken: string;
  message: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export type VerifyBvnResponse = ApiResponseWrapper<VerifyBvnResponseData>;

export interface VerifyPassportResponseData {
  verificationToken: string;
  message: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  phoneNumber: string;
  nationality?: string;
  address?: string;
}

export type VerifyPassportResponse = ApiResponseWrapper<VerifyPassportResponseData>;

// Nigerian signup: send-otp expects verificationToken and verificationType (phone or email)
export interface SendOtpRequestNigerian {
  verificationToken: string;
  verificationType: "phone" | "email"; // Required - specifies where to send OTP
}

export interface SendOtpRequestTourist {
  email: string;
  verificationToken: string;
}

export interface SendOtpRequest {
  bvn?: string;
  passportNumber?: string;
  verificationType: "phone" | "email";
  phoneNumber?: string;
  email?: string;
}

export interface SendOtpResponseData {
  message: string;
  expiresIn?: number;
}

export type SendOtpResponse = ApiResponseWrapper<SendOtpResponseData>;

export interface ValidateOtpRequestNigerian {
  verificationToken: string;
  otp: string;
}

export interface ValidateOtpRequestTourist {
  email: string;
  otp: string;
  verificationToken: string;
}

export interface ValidateOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface ValidateOtpResponseData {
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  // Note: validationToken may be present for next step, but not always in response
  validationToken?: string; // Token to proceed to next step (email OTP for Nigerian, create-account for Tourist)
}

export type ValidateOtpResponse = ApiResponseWrapper<ValidateOtpResponseData>;

// Nigerian email OTP flow (Step 3.5 and 3.6)
export interface SendEmailOtpRequestNigerian {
  email: string;
  verificationToken: string; // From validate-otp step
}

export interface ValidateEmailOtpRequestNigerian {
  email: string;
  otp: string;
  verificationToken: string; // From validate-otp step
}

export interface ValidateEmailOtpResponseData {
  verified: boolean;
  validationToken: string; // Token to proceed to create-account
}

export type ValidateEmailOtpResponse = ApiResponseWrapper<ValidateEmailOtpResponseData>;

export interface CreateNigerianAccountRequest {
  password: string;
  validationToken: string; // From validate-email-otp step
}

export interface CreateTouristAccountRequest {
  password: string;
  validationToken: string; // From validate-otp step
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponseWrapper<RefreshTokenResponseData>;

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
    customerType?: string;
    kycStatus?: string;
    isActive?: boolean;
    createdAt?: string;
  };
}

export type LoginResponse = ApiResponseWrapper<LoginResponseData>;

export interface UserProfileProfile {
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string | null;
  state?: string | null;
  country?: string;
  postalCode?: string | null;
  avatar?: string | null;
}

export interface UserProfileKyc {
  status: string;
  bvn?: string | null;
  tin?: string | null;
  passportNumber?: string | null;
  passportDocumentUrl?: string | null;
  bvnVerified: boolean;
  tinVerified: boolean;
  passportVerified: boolean;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

export interface ActiveSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Full user profile from GET /api/auth/profile (roles, permissions, KYC, etc.).
 * Use this as the source of truth for "current user" in the app.
 */
export interface UserProfile {
  id: string;
  email: string;
  phoneNumber?: string;
  role: string;
  customerType?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile: UserProfileProfile;
  kyc: UserProfileKyc;
  permissions: string[];
  activeSessions?: ActiveSession[];
  fullName?: string;
}

export type ProfileResponse = ApiResponseWrapper<UserProfile>;

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

export interface UploadPassportResponseData {
  passportDocumentUrl: string;
}

export type UploadPassportResponse = ApiResponseWrapper<UploadPassportResponseData>;

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

export interface TransactionListParams extends PaginationParams {
  status?: string;
  search?: string;
  type?: string;
  transactionType?: "Buy FX" | "Sell FX" | "Receive FX";
  dateFrom?: string;
  dateTo?: string;
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
