import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { VerifyBVNModal } from "../VerifyBVNModal";

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
    const onVerify = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
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
        await user.type(inputs[i]!, (i + 1).toString());
      }
    }
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    expect(screen.getByRole("heading", { name: /BVN Verified Successfully/i })).toBeInTheDocument();
    const successButtons = screen.getAllByRole("button", { name: /Continue/i });
    await user.click(successButtons[successButtons.length - 1]!);
    expect(onVerify).toHaveBeenCalledWith("123456");
  });
});
