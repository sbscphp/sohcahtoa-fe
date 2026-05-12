import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

const mockPush = vi.fn();
const mockMutate = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
      login: vi.fn(),
      profile: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "user-id",
          email: "a@b.com",
          phoneNumber: "+1234567890",
          role: "CUSTOMER",
          customerType: "NIGERIAN_CITIZEN",
          isActive: true,
          emailVerified: true,
          phoneVerified: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          profile: {
            firstName: "Test",
            lastName: "User",
          },
          kyc: {
            status: "VERIFIED",
            bvnVerified: true,
            tinVerified: false,
            passportVerified: false,
          },
          permissions: [],
        },
      }),
    },
  },
}));

vi.mock("@/app/_lib/api/error-handler", () => ({
  handleApiError: vi.fn(),
}));

vi.mock("@/app/(customer)/_components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/assets/asset", () => ({ cbnLogo: "/cbn.png" }));

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string; width?: number; height?: number }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} width={props.width} height={props.height} />
  ),
}));

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders Log In to Continue heading", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /Log In to Continue/i })).toBeInTheDocument();
  });

  it("renders Email and Password inputs and Log In button", () => {
    const { container } = render(<LoginPage />);
    expect(screen.getByPlaceholderText(/Enter email address/i)).toBeInTheDocument();
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeDisabled();
  });

  it("enables Log In when email and password are filled", async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);
    await user.type(screen.getByPlaceholderText(/Enter email address/i), "a@b.com");
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput, "pass");
    expect(screen.getByRole("button", { name: /Log In/i })).toBeEnabled();
  });

  it("calls router.push with /dashboard when Log In is clicked", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          user: {
            id: "user-id",
            email: "a@b.com",
            firstName: "Test",
            lastName: "User",
          },
        },
      });
    });

    const { container } = render(<LoginPage />);
    await user.type(screen.getByPlaceholderText(/Enter email address/i), "a@b.com");
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput, "pass");
    await user.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
