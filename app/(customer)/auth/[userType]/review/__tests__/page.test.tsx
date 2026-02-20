import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import ReviewPage from "../page";

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
        sendEmailOtp: vi.fn(),
      },
      tourist: {
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

vi.mock("@/app/(customer)/_components/modals/OTPSentModal", () => ({
  OTPSentModal: ({ opened, onClose, onGoToEmail }: any) =>
    opened ? (
      <div data-testid="otp-sent-modal">
        <button onClick={onGoToEmail}>Continue</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe("Review Page - Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userType: "citizen" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "citizen");
    sessionStorage.setItem("verificationToken", "test-token");
    sessionStorage.setItem("validationToken", "test-token");
    sessionStorage.setItem("fullName", "Test User");
    sessionStorage.setItem("email", "test@example.com");
    sessionStorage.setItem("phoneNumber", "+2341234567890");
    sessionStorage.setItem("address", "123 Test St");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("displays user information from sessionStorage", () => {
    render(<ReviewPage />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("+2341234567890")).toBeInTheDocument();
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });

  it("displays nationality for expatriate users", () => {
    mockUseParams.mockReturnValue({ userType: "expatriate" });
    sessionStorage.setItem("nationality", "Spain");
    sessionStorage.setItem("verificationToken", "test-token");
    
    render(<ReviewPage />);
    expect(screen.getByText("Spain")).toBeInTheDocument();
  });

  it("displays address for citizen users", () => {
    render(<ReviewPage />);
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });

  it("renders send OTP button", () => {
    render(<ReviewPage />);
    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
  });

  it("calls sendEmailOtp API for citizen users", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
      });
    });

    render(<ReviewPage />);
    const button = screen.getByRole("button", { name: /send otp/i });
    
    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          verificationToken: "test-token",
        }),
        expect.any(Object)
      );
    });
  });

  it("calls sendOtp API for tourist/expatriate users", async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ userType: "tourist" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "tourist");
    sessionStorage.setItem("verificationToken", "test-token");
    sessionStorage.setItem("email", "test@example.com");
    sessionStorage.setItem("fullName", "Test User");
    sessionStorage.setItem("phoneNumber", "+2341234567890");

    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
      });
    });

    render(<ReviewPage />);
    const button = screen.getByRole("button", { name: /send otp/i });
    
    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          verificationToken: "test-token",
        }),
        expect.any(Object)
      );
    });
  });

  it("opens OTP sent modal after successful OTP send", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
      });
    });

    render(<ReviewPage />);
    const button = screen.getByRole("button", { name: /send otp/i });
    
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("otp-sent-modal")).toBeInTheDocument();
    });
  });

  it("redirects to verify-email page when continue is clicked from modal", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
      });
    });

    render(<ReviewPage />);
    const button = screen.getByRole("button", { name: /send otp/i });
    
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("otp-sent-modal")).toBeInTheDocument();
    });

    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/citizen/verify-email");
    });
  });

  it("redirects to onboarding if userType is missing", () => {
    mockUseParams.mockReturnValue({ userType: undefined } as unknown as { userType: string });
    render(<ReviewPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });

  it("redirects to BVN page if verificationToken is missing for citizen", () => {
    sessionStorage.removeItem("verificationToken");
    render(<ReviewPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/citizen/bvn");
  });

  it("redirects to upload-passport page if verificationToken is missing for tourist", () => {
    mockUseParams.mockReturnValue({ userType: "tourist" });
    sessionStorage.removeItem("verificationToken");
    render(<ReviewPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/tourist/upload-passport");
  });

  it("handles API error on OTP send failure", async () => {
    const user = userEvent.setup();
    const { handleApiError } = await import("@/app/_lib/api/error-handler");
    
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onError({
        message: "Failed to send OTP",
        status: 400,
      });
    });

    render(<ReviewPage />);
    const button = screen.getByRole("button", { name: /send otp/i });
    
    await user.click(button);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});
