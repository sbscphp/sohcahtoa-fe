import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import VerifyEmailPage from "../page";

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
        validateEmailOtp: vi.fn(),
        resendEmailOtp: vi.fn(),
      },
      tourist: {
        validateOtp: vi.fn(),
        resendOtp: vi.fn(),
      },
    },
  },
}));

vi.mock("@/app/_lib/api/error-handler", () => ({
  handleApiError: vi.fn(),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock("@/app/(customer)/_components/auth/SecurityBadges", () => ({
  SecurityBadges: () => <div>Security Badges</div>,
}));

vi.mock("@/app/(customer)/_components/auth/OTPInput", () => {

  return {
    OTPInput: ({ onComplete, onResend, isResending }: any) => {
      const [value, setValue] = React.useState("");
      return (
        <div data-testid="otp-input">
          <input
            data-testid="otp-input-field"
            value={value}
            onChange={(e) => {
              const newValue = e.target.value.slice(0, 6);
              setValue(newValue);
              if (newValue.length === 6) {
                onComplete(newValue);
              }
            }}
            placeholder="Enter OTP"
          />
          {onResend && (
            <button
              onClick={onResend}
              disabled={isResending}
              data-testid="resend-otp-button"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      );
    },
  };
});

vi.mock("@/app/(customer)/_components/modals/SuccessModal", () => ({
  SuccessModal: ({ opened, onButtonClick }: any) =>
    opened ? (
      <div data-testid="success-modal">
        <button onClick={onButtonClick}>Continue</button>
      </div>
    ) : null,
}));

describe("Verify Email Page - Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userType: "citizen" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "citizen");
    sessionStorage.setItem("email", "test@example.com");
    sessionStorage.setItem("validationToken", "test-validation-token");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("displays user email from sessionStorage", () => {
    render(<VerifyEmailPage />);
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it("renders OTP input field", () => {
    render(<VerifyEmailPage />);
    expect(screen.getByTestId("otp-input")).toBeInTheDocument();
  });

  it("disables verify button when OTP is not complete", async () => {
    render(<VerifyEmailPage />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /^verify$/i });
      expect(button).toBeDisabled();
    });
  });

  it("enables verify button when OTP is complete", async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const button = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it("calls validateEmailOtp API for citizen users when verify is clicked", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.({
        success: true,
        data: {
          validationToken: "new-validation-token",
          message: "Email verified successfully",
        },
      });
    });

    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const button = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationToken: "test-validation-token",
          otp: "123456",
        }),
        expect.any(Object)
      );
    });
  });

  it("calls validateOtp API for tourist/expatriate users", async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ userType: "tourist" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "tourist");
    sessionStorage.setItem("email", "test@example.com");
    sessionStorage.setItem("verificationToken", "test-verification-token");

    mockMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.({
        success: true,
        data: {
          validationToken: "new-validation-token",
          firstName: "Maria",
          lastName: "Zhang",
          email: "test@example.com",
          phoneNumber: "+34320518522",
          nationality: "Spain",
        },
      });
    });

    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const button = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          verificationToken: "test-verification-token",
          otp: "123456",
        }),
        expect.any(Object)
      );
    });
  });

  it("stores validation token and user data in sessionStorage on successful verification", async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ userType: "tourist" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "tourist");
    sessionStorage.setItem("email", "test@example.com");
    sessionStorage.setItem("verificationToken", "test-verification-token");

    mockMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.({
        success: true,
        data: {
          validationToken: "new-validation-token",
          firstName: "Maria",
          lastName: "Zhang",
          email: "test@example.com",
          phoneNumber: "+34320518522",
          nationality: "Spain",
          address: "123 Test St",
        },
      });
    });

    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const button = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    await user.click(button);

    await waitFor(() => {
      expect(sessionStorage.getItem("validationToken")).toBe("new-validation-token");
      expect(sessionStorage.getItem("firstName")).toBe("Maria");
      expect(sessionStorage.getItem("lastName")).toBe("Zhang");
    });
  });

  it("opens success modal after successful verification", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.({
        success: true,
        data: {
          validationToken: "new-validation-token",
          message: "Email verified successfully",
        },
      });
    });

    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const button = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });
  });

  it("redirects to create-password page when continue is clicked from success modal", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.({
        success: true,
        data: {
          validationToken: "new-validation-token",
          message: "Email verified successfully",
        },
      });
    });

    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const verifyButton = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });

    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/citizen/create-password");
    });
  });

  it("renders resend OTP button", () => {
    render(<VerifyEmailPage />);
    expect(screen.getByTestId("resend-otp-button")).toBeInTheDocument();
  });

  it("calls resendEmailOtp API when resend is clicked for citizen", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_data, opts) => {
      opts?.onSuccess?.({ success: true });
    });

    render(<VerifyEmailPage />);
    const resendButton = screen.getByTestId("resend-otp-button");
    
    await user.click(resendButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          verificationToken: "test-validation-token",
        }),
        expect.any(Object)
      );
    });
  });

  it("redirects to onboarding if userType is missing", () => {
    mockUseParams.mockReturnValue({ userType: undefined } as unknown as { userType: string });
    render(<VerifyEmailPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });

  it("redirects to review page if validationToken is missing for citizen", () => {
    sessionStorage.removeItem("validationToken");
    render(<VerifyEmailPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/citizen/review");
  });

  it("handles API error on verification failure", async () => {
    const user = userEvent.setup();
    const { handleApiError } = await import("@/app/_lib/api/error-handler");
    
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onError({
        message: "Invalid OTP",
        status: 400,
      });
    });

    render(<VerifyEmailPage />);
    const otpInput = screen.getByTestId("otp-input-field");
    const button = screen.getByRole("button", { name: /^verify$/i });

    await user.type(otpInput, "123456");
    await user.click(button);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});
