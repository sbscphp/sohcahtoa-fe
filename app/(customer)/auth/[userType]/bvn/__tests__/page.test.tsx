import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
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
        verifyBvn: vi.fn(),
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
        phoneNumber: "+2341234567890",
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

vi.mock("@/app/(customer)/_components/modals/OTPDeliveryModal", () => ({
  OTPDeliveryModal: ({ opened, onClose, onContinue }: any) =>
    opened ? (
      <div data-testid="otp-delivery-modal">
        <button onClick={() => onContinue("email")}>Continue with Email</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
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

describe("BVN Page - Citizen Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userType: "citizen" });
    mockBvnConsentPhase = "idle";
    mockBvnConsentIsActive = false;
    sessionStorage.clear();
    sessionStorage.setItem("userType", "citizen");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByPlaceholderText(/enter your bvn/i), "12345678901");
    await user.type(screen.getByPlaceholderText(/example@email.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/\+2348031234567/i), "+2348031234567");
  };

  it("renders BVN, email, and phone fields", async () => {
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/example@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+2348031234567/i)).toBeInTheDocument();
  });

  it("disables continue button until BVN, email, and phone are valid", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });

    const button = screen.getByRole("button", { name: /continue to nibss consent/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/enter your bvn/i), "12345678901");
    expect(button).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/example@email.com/i), "test@example.com");
    expect(button).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/\+2348031234567/i), "+2348031234567");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it("starts NIBSS consent with bvn, email, and phone", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /continue to nibss consent/i }));

    await waitFor(() => {
      expect(mockStartConsent).toHaveBeenCalledWith({
        bvn: "12345678901",
        email: "test@example.com",
        phoneNumber: "+2348031234567",
      });
    });
  });

  it("stores verification token and user data after consent completes", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /continue to nibss consent/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem("verificationToken")).toBe("test-verification-token");
      expect(sessionStorage.getItem("bvn")).toBe("12345678901");
      expect(sessionStorage.getItem("email")).toBe("test@example.com");
      expect(sessionStorage.getItem("fullName")).toBe("Test User");
      expect(sessionStorage.getItem("phoneNumber")).toBe("+2341234567890");
      expect(sessionStorage.getItem("address")).toBe("123 Test St");
    });
  });

  it("opens OTP delivery modal after successful consent", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /continue to nibss consent/i }));

    await waitFor(() => {
      expect(screen.getByTestId("otp-delivery-modal")).toBeInTheDocument();
    });
  });

  it("redirects to onboarding if userType is not citizen", () => {
    mockUseParams.mockReturnValue({ userType: "tourist" });
    render(<BVNPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });
});
