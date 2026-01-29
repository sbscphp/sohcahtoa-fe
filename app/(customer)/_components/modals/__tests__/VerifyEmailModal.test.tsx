import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { VerifyEmailModal } from "../VerifyEmailModal";

describe("VerifyEmailModal", () => {
  it("renders nothing when opened is false", () => {
    render(
      <VerifyEmailModal
        opened={false}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        email="a@b.com"
      />
    );
    expect(screen.queryByText(/Validate Your Email/i)).not.toBeInTheDocument();
  });

  it("renders title, masked email and Verify button when opened", () => {
    render(
      <VerifyEmailModal
        opened
        onClose={vi.fn()}
        onVerify={vi.fn()}
        email="a@b.com"
      />
    );
    expect(screen.getByRole("heading", { name: /Validate Your Email Address/i })).toBeInTheDocument();
    expect(screen.getByText(/a@b\.com/)).toBeInTheDocument();
    const verify = screen.getByRole("button", { name: /Verify/i });
    expect(verify).toBeDisabled();
  });

  it("enables Verify and calls onVerify after OTP is completed", async () => {
    const onVerify = vi.fn();
    const user = userEvent.setup();
    render(
      <VerifyEmailModal
        opened
        onClose={vi.fn()}
        onVerify={onVerify}
        email="a@b.com"
      />
    );
    const inputs = Array.from(document.querySelectorAll('input[autocomplete="one-time-code"]')) as HTMLInputElement[];
    expect(inputs.length).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < 6; i++) {
      if (inputs[i]) {
        await user.type(inputs[i]!, (i + 1).toString());
      }
    }
    const verify = screen.getByRole("button", { name: /Verify/i });
    expect(verify).toBeEnabled();
    await user.click(verify);
    expect(onVerify).toHaveBeenCalledWith("123456");
  });
});
