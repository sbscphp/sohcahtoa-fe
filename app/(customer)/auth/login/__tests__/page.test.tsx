import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import LoginPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
    const { container } = render(<LoginPage />);
    await user.type(screen.getByPlaceholderText(/Enter email address/i), "a@b.com");
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput, "pass");
    await user.click(screen.getByRole("button", { name: /Log In/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
