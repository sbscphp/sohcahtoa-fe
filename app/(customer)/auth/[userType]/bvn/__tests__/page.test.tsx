import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import BVNPage from "../page";

const mockPush = vi.fn();
const mockMutate = vi.fn();
const mockUseParams = vi.fn(() => ({ userType: "citizen" }));

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
        sendOtp: vi.fn(),
      },
    },
  },
}));

vi.mock("@/app/_lib/api/error-handler", () => ({
  handleApiError: vi.fn(),
}));

vi.mock("@/app/(customer)/_components/auth/SecurityBadges", () => ({
  SecurityBadges: () => <div>Security Badges</div>,
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
    sessionStorage.clear();
    sessionStorage.setItem("userType", "citizen");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders BVN input field and verify button", async () => {
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /verify bvn/i })).toBeInTheDocument();
  });

  it("disables verify button when BVN is not 11 digits", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/enter your bvn/i);
    const button = screen.getByRole("button", { name: /verify bvn/i });

    expect(button).toBeDisabled();

    await user.type(input, "12345");
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it("enables verify button when BVN is exactly 11 digits", async () => {
    const user = userEvent.setup();
    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/enter your bvn/i);
    const button = screen.getByRole("button", { name: /verify bvn/i });

    await user.type(input, "12345678901");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it("calls verifyBvn API when verify button is clicked with valid BVN", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          verificationToken: "test-token",
          email: "test@example.com",
          fullName: "Test User",
          phoneNumber: "+2341234567890",
          address: "123 Test St",
        },
      });
    });

    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/enter your bvn/i);
    const button = screen.getByRole("button", { name: /verify bvn/i });

    await user.type(input, "12345678901");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { bvn: "12345678901" },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it("stores verification token and user data in sessionStorage on successful verification", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          verificationToken: "test-verification-token",
          email: "test@example.com",
          fullName: "Test User",
          phoneNumber: "+2341234567890",
          address: "123 Test St",
        },
      });
    });

    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/enter your bvn/i);
    const button = screen.getByRole("button", { name: /verify bvn/i });

    await user.type(input, "12345678901");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await user.click(button);

    await waitFor(() => {
      expect(sessionStorage.getItem("verificationToken")).toBe("test-verification-token");
      expect(sessionStorage.getItem("bvn")).toBe("12345678901");
      expect(sessionStorage.getItem("email")).toBe("test@example.com");
      expect(sessionStorage.getItem("fullName")).toBe("Test User");
      expect(sessionStorage.getItem("phoneNumber")).toBe("+2341234567890");
      expect(sessionStorage.getItem("address")).toBe("123 Test St");
    });
  });

  it("opens OTP delivery modal after successful BVN verification", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          verificationToken: "test-token",
          email: "test@example.com",
          fullName: "Test User",
        },
      });
    });

    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/enter your bvn/i);
    const button = screen.getByRole("button", { name: /verify bvn/i });

    await user.type(input, "12345678901");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("otp-delivery-modal")).toBeInTheDocument();
    });
  });

  it("redirects to onboarding if userType is not citizen", () => {
    mockUseParams.mockReturnValue({ userType: "tourist" });
    render(<BVNPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });

  it("handles API error on verification failure", async () => {
    const user = userEvent.setup();
    const { handleApiError } = await import("@/app/_lib/api/error-handler");
    
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onError({
        message: "BVN verification failed",
        status: 400,
      });
    });

    render(<BVNPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your bvn/i)).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText(/enter your bvn/i);
    const button = screen.getByRole("button", { name: /verify bvn/i });

    await user.type(input, "12345678901");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await user.click(button);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});
