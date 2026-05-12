import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test-utils";
import { VerifyBVNModal } from "../VerifyBVNModal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@/app/_lib/api/hooks", () => ({
  useCreateData: () => ({
    mutate: vi.fn((_data: unknown, opts: { onSuccess?: (r: unknown) => void }) => {
      opts?.onSuccess?.({ success: true, data: { message: "BVN verified" } });
    }),
    isPending: false,
  }),
}));

vi.mock("@/app/(customer)/_services/customer-api", () => ({
  customerApi: { auth: { nigerian: { validateOtp: vi.fn(), resendOtp: vi.fn() } } },
}));

vi.mock("@/app/_lib/api/error-handler", () => ({ handleApiError: vi.fn() }));

vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }));

describe("VerifyBVNModal", () => {
  it("renders nothing when opened is false", () => {
    render(
      <VerifyBVNModal
        opened={false}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        bvn="12345678901"
        deliveryMethod="email"
      />
    );
    expect(screen.queryByText(/Verify BVN/i)).not.toBeInTheDocument();
  });

  it("renders title, masked BVN and Continue when opened", () => {
    render(
      <VerifyBVNModal
        opened
        onClose={vi.fn()}
        onVerify={vi.fn()}
        bvn="12345678901"
        deliveryMethod="email"
      />
    );
    expect(screen.getByRole("heading", { name: /Verify BVN/i })).toBeInTheDocument();
    expect(screen.getByText(/123\*\*\*\*\*901/)).toBeInTheDocument();
    expect(screen.getByText(/email/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
  });

  it("shows phone when deliveryMethod is phone", () => {
    render(
      <VerifyBVNModal
        opened
        onClose={vi.fn()}
        onVerify={vi.fn()}
        bvn="12345678901"
        deliveryMethod="phone"
      />
    );
    expect(screen.getByText(/phone number/)).toBeInTheDocument();
  });

  it("enables Continue and shows SuccessModal after OTP complete and Continue", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key: string) => (key === "verificationToken" ? "mock-token" : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });
    const onVerify = vi.fn();
    const user = userEvent.setup();
    render(
      <VerifyBVNModal
        opened
        onClose={vi.fn()}
        onVerify={onVerify}
        bvn="12345678901"
        deliveryMethod="email"
      />
    );
    const inputs = Array.from(document.querySelectorAll('input[autocomplete="one-time-code"]')) as HTMLInputElement[];
    expect(inputs.length).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < 6; i++) {
      if (inputs[i]) {
        await user.click(inputs[i]!);
        await user.keyboard((i + 1).toString());
      }
    }
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).not.toBeDisabled();
    });
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(
      () => {
        expect(screen.getByText(/BVN Verified Successfully/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    const successButtons = screen.getAllByRole("button", { name: /Continue/i });
    await user.click(successButtons[successButtons.length - 1]!);
    await waitFor(() => {
      expect(screen.queryByText(/BVN Verified Successfully/i)).not.toBeInTheDocument();
    });
  });
});
