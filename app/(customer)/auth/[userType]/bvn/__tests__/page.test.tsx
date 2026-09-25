import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import BVNPage from "../page";

const mockPush = vi.fn();
const mockUseParams = vi.fn(() => ({ userType: "citizen" }));
const mockStartConsent = vi.fn();
const mockOpenConsentPortal = vi.fn();
const mockRetryPolling = vi.fn();
const mockCancel = vi.fn();
const mockReset = vi.fn();
const mockMutate = vi.fn();

let mockBvnConsentPhase = "idle";
let mockBvnConsentIsActive = false;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockUseParams(),
}));

vi.mock("@mantine/dates", () => ({
  DateInput: ({
    id,
    value,
    onChange,
    placeholder,
    error,
    disabled,
  }: {
    id?: string;
    value: Date | null;
    onChange: (value: Date | null) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <input
        id={id}
        aria-label="Date of Birth"
        placeholder={placeholder}
        disabled={disabled}
        value={value ? value.toISOString().slice(0, 10) : ""}
        onChange={(e) => {
          const next = e.currentTarget.value;
          onChange(next ? new Date(`${next}T00:00:00.000Z`) : null);
        }}
      />
      {error ? <span>{error}</span> : null}
    </div>
  ),
}));

vi.mock("@/app/_lib/api/hooks", () => ({
  useCreateData: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock("@/app/(customer)/_services/customer-api", () => ({
  customerApi: {
    auth: {
      nigerian: {
        igreeInitiate: vi.fn(),
        bvnConsentStatus: vi.fn(),
        sendOtp: vi.fn(),
      },
    },
  },
}));

vi.mock("@/app/_lib/api/error-handler", () => ({
  handleApiError: vi.fn(),
}));

vi.mock("@/app/_lib/nibss-bvn-consent/use-bvn-consent-flow", () => ({
  useBvnConsentFlow: ({ onCompleted }: { onCompleted?: (data: unknown) => void }) => ({
    phase: mockBvnConsentPhase,
    statusMessage: null,
    usedPopup: true,
    isActive: mockBvnConsentIsActive,
    startConsent: (...args: unknown[]) => {
      mockStartConsent(...args);
      mockBvnConsentIsActive = true;
      mockBvnConsentPhase = "polling";
      onCompleted?.({
        verificationToken: "test-verification-token",
        email: "test@example.com",
        fullName: "Test User",
        phoneNumber: "+2348031234567",
        address: "123 Test St",
      });
      mockBvnConsentIsActive = false;
      mockBvnConsentPhase = "completed";
    },
    openConsentPortal: mockOpenConsentPortal,
    retryPolling: mockRetryPolling,
    cancel: mockCancel,
    reset: mockReset,
  }),
}));

vi.mock("@/app/(customer)/_components/auth/SecurityBadges", () => ({
  SecurityBadges: () => <div>Security Badges</div>,
}));

vi.mock("@/app/_components/nibss-bvn-consent/BvnConsentOverlay", () => ({
  BvnConsentOverlay: ({ opened }: { opened: boolean }) =>
    opened ? <div data-testid="bvn-consent-overlay">Consent Overlay</div> : null,
}));

vi.mock("@/app/(customer)/_components/modals/VerifyBVNModal", () => ({
  VerifyBVNModal: ({ opened, onClose, onVerify }: any) =>
    opened ? (
      <div data-testid="verify-bvn-modal">
        <button onClick={() => onVerify("123456")}>Verify</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe("BVN Page - Citizen Onboarding (iGree)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userType: "citizen" });
    mockBvnConsentPhase = "idle";
    mockBvnConsentIsActive = false;
    sessionStorage.clear();
    sessionStorage.setItem("userType", "citizen");
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ success: true, data: {} });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders iGree identity fields", async () => {
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^bvn$/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /verify bvn/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /verify bvn/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/bvn is required/i)).toBeInTheDocument();
    });
    expect(mockStartConsent).not.toHaveBeenCalled();
  });

  it("starts iGree consent with full payload and sends email OTP", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/^bvn$/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Smith");
    await user.type(screen.getByLabelText(/email address/i), "john@example.com");
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "1990-01-01" },
    });
    await user.type(screen.getByLabelText(/phone number/i), "8031234567");
    await user.type(screen.getByLabelText(/^bvn$/i), "12345678901");

    await user.click(screen.getByRole("button", { name: /verify bvn/i }));

    await waitFor(() => {
      expect(mockStartConsent).toHaveBeenCalledWith({
        bvn: "12345678901",
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        dateOfBirth: "1990-01-01",
        phoneNumber: "+2348031234567",
      });
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          verificationToken: "test-verification-token",
          verificationType: "email",
        },
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("verify-bvn-modal")).toBeInTheDocument();
    });
  });

  it("redirects to onboarding if userType is not citizen", () => {
    mockUseParams.mockReturnValue({ userType: "tourist" });
    render(<BVNPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });
});
