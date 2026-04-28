/**
 * API Types based on Swagger/OpenAPI documentation
 * These types match the API endpoints and payloads
 */

import type { DocumentType } from "@/app/(customer)/_utils/transaction-document-requirements";

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

export type VerifyPassportResponse =
  ApiResponseWrapper<VerifyPassportResponseData>;

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

export type ValidateEmailOtpResponse =
  ApiResponseWrapper<ValidateEmailOtpResponseData>;

export interface CreateNigerianAccountRequest {
  password: string;
  verificationToken: string;
}

export interface CreateTouristAccountRequest {
  password: string;
  verificationToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponseWrapper<RefreshTokenResponseData>;

// ==================== Password Reset Types ====================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  message: string;
  otp?: string; // OTP returned in response (for testing/dev)
}

export type ForgotPasswordResponse =
  ApiResponseWrapper<ForgotPasswordResponseData>;

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponseData {
  resetToken: string;
  message: string;
}

export type VerifyResetOtpResponse =
  ApiResponseWrapper<VerifyResetOtpResponseData>;

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponseData {
  message: string;
}

export type ResetPasswordResponse =
  ApiResponseWrapper<ResetPasswordResponseData>;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface ChangePasswordResponseData {
  message: string;
}

export type ChangePasswordResponse =
  ApiResponseWrapper<ChangePasswordResponseData>;

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
  /** National Identification Number (when returned on profile / login). */
  nin?: string | null;
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

// ==================== Agent Customer Types ====================

export interface AgentAuthProfile {
  id: string;
  email: string;
  phone_number: string | null;
  date_joined: string;
  last_active: string;
  gender: string | null;
  date_of_birth: string | null;
  bvn: string | null;
  tin: string | null;
  [key: string]: string | number | boolean | null;
}

export type AgentAuthProfileResponse = ApiResponseWrapper<AgentAuthProfile>;

export interface AgentDashboardRecentTransaction {
  transactionId: string;
  timestamp: string;
  amount: number;
  currency: string;
}

export interface AgentDashboardRecentTransactionsResponse
  extends ApiResponseWrapper<AgentDashboardRecentTransaction[]> {
  pagination: PaginationMetadata;
}

export type AgentDashboardRange =
  | "today"
  | "this_week"
  | "last_30_days"
  | "last_3_months"
  | "last_year";

export interface AgentDashboardTransactionsByTypeSegment {
  transactionType: string;
  count: number;
  totalAmount: number;
  percentageOfVolume: number;
}

export interface AgentDashboardTransactionsByTypeData {
  range: AgentDashboardRange | string;
  rangeStart: string;
  rangeEnd: string;
  amountBasis: string;
  totalTransactionCount: number;
  totalVolume: number;
  segments: AgentDashboardTransactionsByTypeSegment[];
}

export type AgentDashboardTransactionsByTypeResponse =
  ApiResponseWrapper<AgentDashboardTransactionsByTypeData>;

export type AgentDashboardCashStatsPeriod =
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "last_year";

export interface AgentDashboardCashStatsData {
  currency: string;
  currencyName: string;
  period: {
    preset: string;
    start: string;
    end: string;
  };
  totalCashReceivedFromCustomer: number;
  totalCashReceivedFromAdmin: number;
  totalCashDisbursed: number;
}

export type AgentDashboardCashStatsResponse =
  ApiResponseWrapper<AgentDashboardCashStatsData>;

export type AgentPaymentMovementType =
  | "cash_disbursed"
  | "cash_received_from_admin"
  | "cash_received_from_customer";


export interface AgentPaymentMovementItem {
  transaction_id: string;
  transaction_date: string;
  customer_full_name?: string | null;
  sender_full_name?: string | null;
  amount_disbursed?: number | null;
  amount_received?: number | null;
  currency_pair?: string | null;
  prepaid_amount?: number | null;
  transaction_type?: string | null;
  admin_full_name?: string | null;
  [key: string]: unknown;
}

export interface AgentPaymentMovementsResponse
  extends ApiResponseWrapper<AgentPaymentMovementItem[]> {
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AgentCustomerListParams extends PaginationParams {
  status?: string;
  lastTransactionType?: string;
  customerType?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface AgentCustomerSummary {
  userId: string;
  fullName: string;
  customerType: string;
  lastTransactionType: string | null;
  registeredAt: string;
  kycStatus: string;
}

export interface AgentCustomerListResponse
  extends ApiResponseWrapper<AgentCustomerSummary[]> {
  metadata: ApiResponseWrapper<unknown>["metadata"] & {
    pagination: PaginationMetadata;
  };
}

export interface AgentCustomerStats {
  totalCustomers: number;
  verifiedCustomers: number;
  repeatCustomers: number;
  pendingKyc: number;
}

export type AgentCustomerStatsResponse =
  ApiResponseWrapper<AgentCustomerStats>;

export interface AgentCustomerFile {
  id: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AgentCustomerIdDetails {
  idType: string | null;
  bvn: string | null;
  tin: string | null;
  formAId: string | null;
}

export interface AgentCustomerDetails {
  userId: string;
  registeredAt: string;
  fullName: string;
  email: string;
  dateOnboarded: string;
  totalTransactionsCompleted: number;
  idDetails: AgentCustomerIdDetails;
  files: Record<string, AgentCustomerFile | null>;
}

export type AgentCustomerDetailsResponse =
  ApiResponseWrapper<AgentCustomerDetails>;

export interface AgentCustomerUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AgentCustomerUpdateData {
  userId: string;
  fullName: string;
  phoneNumber: string;
  customerType: string;
  kycStatus: string;
}

export type AgentCustomerUpdateResponse =
  ApiResponseWrapper<AgentCustomerUpdateData>;

export interface AgentCustomerTransaction {
  transactionId: string;
  transactionDate: string;
  transactionType: string;
  transactionStatus: string;
  transactionReferenceNumber: string;
  currency: string;
  foreignAmount: number;
}

export interface AgentCustomerTransactionsResponse
  extends ApiResponseWrapper<AgentCustomerTransaction[]> {
  metadata: ApiResponseWrapper<unknown>["metadata"] & {
    pagination: PaginationMetadata;
  };
}

// ==================== Agent Transaction Detail Types ====================

export interface AgentTransactionDetailIdentification {
  full_name: string | null;
  email_address: string | null;
  phone_number: string | null;
  address: string | null;
}

export interface AgentTransactionDetailTransactionDetails {
  transaction_id: string;
  amount: number;
  equivalent_amount: number;
  currency: string;
  date_initiated: string;
}

export interface AgentTransactionDetailRequiredDocuments {
  bvn: string | null;
  nin: string | null;
  admission_type: string | null;
  form_a_id: string | null;
  evidence_of_admission: string | null;
  school_invoice: string | null;
  international_passport_number: string | null;
}

export interface AgentTransactionDetailData {
  timestamp: string;
  identification: AgentTransactionDetailIdentification;
  transaction_details: AgentTransactionDetailTransactionDetails;
  beneficiary_details: Record<string, unknown>;
  required_documents: AgentTransactionDetailRequiredDocuments;
}

export type AgentTransactionDetailApiResponse = ApiResponseWrapper<AgentTransactionDetailData>;

// ==================== Transaction Types ====================

export type TransactionTypeAPI =
  | "PTA"
  | "BTA"
  | "SCHOOL_FEES"
  | "MEDICAL"
  | "PROFESSIONAL_BODY"
  | "TOURIST_FX"
  | "RESIDENT_FX"
  | "EXPATRIATE_FX"
  | "IMTO_REMITTANCE"
  | "CASH_REMITTANCE";

export type AdmissionType = "UNDERGRADUATE" | "POSTGRADUATE" | "OTHER";

export interface TransactionDocument {
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  state?: string;
  city?: string;
  pickupDate?: string;
  pickupTime?: string;
}

export interface CreateTransactionRequest {
  type: TransactionTypeAPI;
  currency: string;
  amount: number;
  purpose: string;
  destinationCountry: string;
  /** Optional: when an agent creates a transaction on behalf of a customer. */
  customerId?: string;
  bvn?: string;
  nin?: string;
  formAId?: string;
  passportDocumentNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  visaDocumentNumber?: string;
  returnTicketDocumentNumber?: string;
  tinNumber?: string;
  workPermitNumber?: string;
  utilityBillNumber?: string;
  admissionType?: AdmissionType;
  beneficiaryDetails?: Record<string, unknown>;
  pickupLocation?: PickupLocation;
  documents?: TransactionDocument[];
}

export interface Transaction {
  id: string;
  referenceNumber?: string;
  transactionId?: string;
  type: string;
  amount?: number;
  currency?: string;
  status: string;
  stage: string;
  date: string;
  transaction_type: "Buy FX" | "Sell FX" | "Receive FX";
}

export interface TransactionListDocument {
  id: string;
  documentType: string;
  verificationStatus: string;
  uploadedAt: string;
}

export interface TransactionListCashPickup {
  pickupLocation: string;
  status: string;
}

export interface TransactionListItem {
  transactionId?: string;
  id: string;
  referenceNumber?: string;
  type: string;
  status: string;
  currentStep: string;
  purpose: string;
  destinationCountry: string;
  currency: string;
  foreignAmount: string;
  nairaEquivalent: string | null;
  exchangeRate: string | null;
  disbursementMethod: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  documents: TransactionListDocument[];
  cashPickup: TransactionListCashPickup;
  group: "BUY" | "SELL" | "REMITTANCE";
  transaction_date?: string;
  transaction_type?: string;
  transaction_stage?: string;
  transaction_status?: string;
  reference_number?: string;
  transaction_id?: string;
}

export interface TransactionsListApiResponse {
  success: boolean;
  data: TransactionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    timestamp?: string;
    requestId?: string;
    version?: string;
  };
}

export interface TransactionOverviewGroupSummary {
  totalAmount: number;
  currency: string;
  transactionCount: number;
}

export interface TransactionOverviewData {
  all: TransactionOverviewGroupSummary;
  buy: TransactionOverviewGroupSummary;
  sell: TransactionOverviewGroupSummary;
  remittance: TransactionOverviewGroupSummary;
}

export interface TransactionOverviewResponse {
  success: boolean;
  data: TransactionOverviewData;
}

export interface TransactionOverviewCustomRate {
  currency: string;
  rate: number;
}

export interface TransactionOverviewRequest {
  customRates?: TransactionOverviewCustomRate[];
}

export interface TransactionDetail extends Transaction {
  transactionDetails?: {
    transactionId: string;
    amount: { code: string; formatted: string };
    equivalentAmount: { code: string; formatted: string };
    dateInitiated: string;
    pickupAddress?: string;
  };
  paymentDetails?: Record<string, unknown>;
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

export interface TransactionDetailRequiredDocUploaded {
  id: string;
  fileName: string;
  fileUrl: string;
  status: string;
  rejectionNotes: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
}

export interface TransactionDetailRequiredDoc {
  type: string;
  uploaded: TransactionDetailRequiredDocUploaded | null;
}

export interface TransactionDetailStepData {
  bvn?: string;
  nin?: string;
  tin?: string;
  formAId?: string;
  admissionType?: string | null;
  pickupLocation?: {
    id: string;
    name: string;
    address: string;
    recipientName: string;
    recipientPhone: string;
  };
}

export interface TransactionDetailStep {
  id: string;
  transactionId: string;
  step: string;
  status: string;
  data: TransactionDetailStepData;
  completedAt: string;
  createdAt: string;
}

export interface TransactionDetailCashPickup {
  id: string;
  transactionId: string;
  pickupLocation: string;
  pickupLocationId: string;
  pickupState: string | null;
  pickupCity: string | null;
  pickupCode: string;
  recipientName: string | null;
  recipientPhone: string | null;
  amount: string;
  currency: string;
  status: string;
  scheduledPickupDate: string | null;
  scheduledPickupTime: string | null;
  expiryDate: string;
  pickedUpAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetailPaymentEntry {
  id: string;
  sessionId?: string | null;
  amount: string;
  settledAmount?: string | null;
  feeAmount?: string | null;
  currency: string;
  sourceAccountNumber?: string | null;
  sourceAccountName?: string | null;
  sourceBankName?: string | null;
  tranRemarks?: string | null;
  tranDateTime: string;
  status: string;
  verifiedAt?: string | null;
  createdAt?: string | null;
}

export interface TransactionDetailComment {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  /** Some API responses use `addedBy` instead of `performedByName`. */
  addedBy?: string | null;
  performedBy?: string | null;
  performedByName?: string | null;
  previousValue?:
    | string
    | number
    | boolean
    | Record<string, string | number | boolean | null>
    | null;
  newValue?:
    | string
    | number
    | boolean
    | Record<string, string | number | boolean | null>
    | null;
  metadata?: {
    documentId?: string;
    documentType?: string;
    [key: string]: unknown;
  } | null;
}

export interface TransactionDetailData {
  transactionId: string;
  referenceNumber: string;
  type: string;
  mode: string | null;
  status: string;
  currentStep: string;
  purpose: string;
  destinationCountry: string;
  currency: string;
  foreignAmount: string;
  nairaEquivalent: string | null;
  exchangeRate: string | null;
  disbursementMethod: string | null;
  formAId?: string | null;
  taxClearanceNumber?: string | null;
  personalInfo?: {
    bvn: string | null;
    nin: string | null;
    admissionType: string | null;
  } | null;
  beneficiaryDetails?: Record<string, unknown> | null;
  rejection: string | null;
  requiredDocuments: TransactionDetailRequiredDoc[];
  cashPickup: TransactionDetailCashPickup | null;
  prepaidCard: Record<string, unknown> | null;
  settlement?: Record<string, unknown> | null;
  paymentDetails?: TransactionDetailPaymentEntry[] | null;
  steps: TransactionDetailStep[];
  comments?: TransactionDetailComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetailApiResponse {
  success: boolean;
  data: TransactionDetailData;
  metadata?: { timestamp?: string; requestId?: string; version?: string };
}

// ==================== Support Types ====================

export type SupportTicketCategory =
  | "TRANSACTION_ISSUE"
  | "ACCOUNT_ACCESS"
  | "PAYMENT_ISSUE"
  | "DOCUMENT_VERIFICATION"
  | "TECHNICAL_ISSUE"
  | "COMPLIANCE_INQUIRY"
  | "GENERAL_INQUIRY"
  | "OTHER";

export interface SupportTicket {
  id: string;
  reference: string;
  category: SupportTicketCategory;
  status: string;
  subject?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketListResponse {
  success: boolean;
  data: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupportTicketDetail extends SupportTicket {
  messages?: {
    id: string;
    from: string;
    message: string;
    createdAt: string;
  }[];
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

export interface SupportTicketDetailResponse {
  success: boolean;
  data: SupportTicketDetail;
}

export interface AgentSupportTicketListItem {
  id: string;
  caseType: SupportTicketCategory;
  category: SupportTicketCategory;
  timestamp: string;
  status: string;
  description: string;
}

export interface AgentSupportTicketListResponse {
  success: boolean;
  data: AgentSupportTicketListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    timestamp?: string;
    requestId?: string;
    version?: string;
  };
}

export interface AgentSupportTicketMessage {
  senderMail: string;
  senderTimestamp: string;
  senderMessage: string;
}

export interface AgentSupportTicketDetailData {
  ticketId: string;
  reference: string;
  category: SupportTicketCategory;
  description: string;
  status: string;
  timestamp: string;
  customerEmail: string;
  messages: AgentSupportTicketMessage[];
}

export interface AgentSupportTicketDetailResponse {
  success: boolean;
  data: AgentSupportTicketDetailData;
  metadata?: {
    timestamp?: string;
    requestId?: string;
    version?: string;
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

// Customer transaction exchange rate (buy/sell FX)
export interface TransactionRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  buyRate: number;
  sellRate: number;
  validFrom: string;
  validUntil: string;
}

export type TransactionRatesListResponse = ApiResponseWrapper<TransactionRate[]>;

export interface CalculateTransactionRateRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface CalculateTransactionRateData {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  sellRate: number;
  buyRate: number;
  convertedAmount: number;
  rateValidUntil: string;
}

export type CalculateTransactionRateResponse =
  ApiResponseWrapper<CalculateTransactionRateData>;

/** Item from GET .../pickup-locations/terminals (`data.terminals`). */
export interface PickupTerminal {
  id: string;
  name: string;
  address: string;
  state: string;
  city?: string;
  region?: string;
  email?: string;
  phoneNumber?: string;
  available?: boolean;
}

export type PickupTerminalsData = {
  terminals: PickupTerminal[];
};

export type PickupPointsResponse = ApiResponseWrapper<PickupTerminalsData>;

/** Query params for GET .../pickup-locations/terminals (all optional; omit for full list). */
export interface PickupTerminalsQueryParams {
  state?: string;
  city?: string;
  pickupDate?: string;
  pickupTime?: string;
}

export type PickupLocationStatesResponse = ApiResponseWrapper<{
  states: string[];
}>;

export type PickupLocationCitiesResponse = ApiResponseWrapper<{
  state?: string;
  cities: string[];
}>;

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

export interface TransactionVirtualAccountData {
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  expiresAt?: string;
  amount?: string | number | null;
  [key: string]: unknown;
}

export type TransactionVirtualAccountResponse =
  ApiResponseWrapper<TransactionVirtualAccountData>;

export interface TransactionDepositInstructionsData {
  title?: string;
  message?: string;
  instructions?: string[] | string;
  note?: string;
  [key: string]: unknown;
}

export type TransactionDepositInstructionsResponse =
  ApiResponseWrapper<TransactionDepositInstructionsData>;

export interface TransactionDepositStatusData {
  hasDeposit: boolean;
  depositStatus: string | null;
  depositAmount: number | string | null;
  depositDate: string | null;
  transactionStatus: string;
  awaitingDeposit: boolean;
  depositConfirmed: boolean;
}

export type TransactionDepositStatusResponse =
  ApiResponseWrapper<TransactionDepositStatusData>;

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

export type UploadPassportResponse =
  ApiResponseWrapper<UploadPassportResponseData>;

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
  q?: string;
  status?: string;
  type?: string;
  group?: "BUY" | "SELL" | "REMITTANCE";
  currency?: string;
  stage?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  title: string;
  message?: string;
  body?: string;
  type?: string;
  read?: boolean;
  isRead?: boolean;
  actionUrl?: string | null;
  data?: {
    actionUrl?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}

export interface NotificationsListResponse {
  success: true;
  data: {
    notifications: Notification[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface UnreadCountResponse {
  success: true;
  data: {
    count: number;
  };
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  emailTransactional: boolean;
  emailMarketing: boolean;
  emailSecurity: boolean;
  smsEnabled: boolean;
  smsTransactional: boolean;
  smsMarketing: boolean;
  smsSecurity: boolean;
  pushEnabled: boolean;
  pushTransactional: boolean;
  pushMarketing: boolean;
  pushSecurity: boolean;
  inAppEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationPreferencesResponse =
  ApiResponseWrapper<NotificationPreferences>;

export interface UpdateNotificationPreferencesRequest {
  emailEnabled?: boolean;
  emailTransactional?: boolean;
  emailMarketing?: boolean;
  emailSecurity?: boolean;
  smsEnabled?: boolean;
  smsTransactional?: boolean;
  smsMarketing?: boolean;
  smsSecurity?: boolean;
  pushEnabled?: boolean;
  pushTransactional?: boolean;
  pushMarketing?: boolean;
  pushSecurity?: boolean;
  inAppEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

export interface ReadAllNotificationsResponse {
  success: true;
  message: string;
  data: {
    count: number;
  };
}

export interface RegisterDeviceRequest {
  deviceToken: string;
  platform: "web" | "ios" | "android";
}

export interface Device {
  id: string;
  userId: string;
  deviceToken: string;
  platform: string;
  createdAt: string;
}

export interface DevicesListResponse {
  success: true;
  data: {
    devices: Device[];
    total: number;
  };
}

// ==================== Document Types ====================

export interface DocumentUploadResponse {
  success: true;
  data: {
    id: string;
    documentType: DocumentType;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    verificationStatus: string;
    uploadedAt: string;
    metadata: Record<string, unknown>;
  };
}

export interface Document {
  id: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  verificationStatus: string;
  uploadedAt: string;
  metadata: Record<string, unknown>;
}

export interface DocumentsListResponse {
  success: true;
  data: {
    data: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MultipleDocumentsUploadResponse {
  success: true;
  data: {
    documents: Document[];
    uploadedCount: number;
  };
}

/** JSON body for document upload (e.g. documents as base64 strings) so request shows in DevTools as application/json */
export interface UploadDocumentsJsonRequest {
  userId: string;
  documentTypes: string[];
  documents: string[];
  transactionId?: string;
}
