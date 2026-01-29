import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import OnboardingPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/app/(customer)/_utils/auth-flow", () => ({
  getNextStep: (type: string) => `/${type}/bvn`,
}));

vi.mock("@/app/assets/asset", () => ({
  citizenIcon: "/citizen.png",
  touristIcon: "/tourist.png",
  expatriateIcon: "/expatriate.png",
  cbnLogo: "/cbn.png",
}));

vi.mock("@/app/(customer)/_components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} />
  ),
}));

describe("Onboarding page", () => {
  it("renders the welcome heading and subtext", () => {
    render(<OnboardingPage />);
    expect(screen.getByRole("heading", { name: /welcome to sohcahtoa/i })).toBeInTheDocument();
    expect(
      screen.getByText(/join us to easily buy, sell, or receive foreign exchange/i)
    ).toBeInTheDocument();
  });

  it("renders Citizen, Tourist and Expatriate cards", () => {
    render(<OnboardingPage />);
    expect(screen.getByRole("button", { name: /citizen/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tourist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /expatriate/i })).toBeInTheDocument();
  });

  it("renders Continue button disabled when no type is selected", () => {
    render(<OnboardingPage />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("enables Continue when a type is selected", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);
    await user.click(screen.getByRole("button", { name: /citizen/i }));
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
  });

  it("calls router.push with the correct path when Continue is clicked after selecting", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);
    await user.click(screen.getByRole("button", { name: /citizen/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(mockPush).toHaveBeenCalledWith("/citizen/bvn");
  });
});
