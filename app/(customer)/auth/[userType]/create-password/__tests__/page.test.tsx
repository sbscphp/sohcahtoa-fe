import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import CreatePasswordPage from "../page";

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
        createAccount: vi.fn(),
      },
      tourist: {
        createAccount: vi.fn(),
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

vi.mock("@/app/(customer)/_components/modals/SuccessModal", () => ({
  SuccessModal: ({ opened, onButtonClick }: any) =>
    opened ? (
      <div data-testid="success-modal">
        <button onClick={onButtonClick}>Continue To Log In</button>
      </div>
    ) : null,
}));

describe("Create Password Page - Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userType: "citizen" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "citizen");
    sessionStorage.setItem("validationToken", "test-validation-token");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders password and confirm password inputs", () => {
    render(<CreatePasswordPage />);
    const inputs = screen.getAllByPlaceholderText(/enter password/i);
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toBeInTheDocument();
    expect(inputs[1]).toBeInTheDocument();
  });

  it("displays password requirements", () => {
    render(<CreatePasswordPage />);
    expect(screen.getByText(/8-12 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/uppercase letters/i)).toBeInTheDocument();
    expect(screen.getByText(/numbers/i)).toBeInTheDocument();
    expect(screen.getByText(/special characters/i)).toBeInTheDocument();
  });

  it("disables create password button when password is empty", () => {
    render(<CreatePasswordPage />);
    const button = screen.getByRole("button", { name: /create password/i });
    expect(button).toBeDisabled();
  });

  it("disables create password button when password doesn't meet requirements", async () => {
    const user = userEvent.setup();
    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "short");
    await user.type(confirmInput, "short");
    
    expect(button).toBeDisabled();
  });

  it("enables create password button when password meets all requirements", async () => {
    const user = userEvent.setup();
    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@#");

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("calls createAccount API when create password is clicked with valid password", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: {
            id: "user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      });
    });

    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "Test123!@",
          validationToken: "test-validation-token",
        }),
        expect.any(Object)
      );
    });
  });

  it("clears onboarding sessionStorage and opens success modal on successful account creation", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: {
            id: "user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      });
    });

    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(sessionStorage.getItem("verificationToken")).toBeNull();
      expect(sessionStorage.getItem("validationToken")).toBeNull();
    });
  });

  it("opens success modal after successful account creation", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: {
            id: "user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      });
    });

    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });
  });

  it("clears onboarding sessionStorage and redirects to login when continue is clicked", async () => {
    const user = userEvent.setup();

    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: {
            id: "user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      });
    });

    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });

    const continueButton = screen.getByRole("button", { name: /continue to log in/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("uses verificationToken as fallback for tourist/expatriate users", async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ userType: "tourist" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "tourist");
    sessionStorage.setItem("verificationToken", "test-verification-token");

    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: {
            id: "user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      });
    });

    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "Test123!@",
          validationToken: "test-verification-token",
        }),
        expect.any(Object)
      );
    });
  });

  it("redirects to onboarding if userType is missing", () => {
    mockUseParams.mockReturnValue({ userType: undefined } as unknown as { userType: string });
    render(<CreatePasswordPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });

  it("redirects to verify-email if validationToken is missing for citizen", () => {
    sessionStorage.removeItem("validationToken");
    render(<CreatePasswordPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/citizen/verify-email");
  });

  it("handles API error on account creation failure", async () => {
    const user = userEvent.setup();
    const { handleApiError } = await import("@/app/_lib/api/error-handler");
    
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onError({
        message: "Account creation failed",
        status: 400,
      });
    });

    render(<CreatePasswordPage />);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const button = screen.getByRole("button", { name: /create password/i });

    await user.type(passwordInput, "Test123!@");
    await user.type(confirmInput, "Test123!@");
    await user.click(button);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});
