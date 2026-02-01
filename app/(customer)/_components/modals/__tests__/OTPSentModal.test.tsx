import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { OTPSentModal } from "../OTPSentModal";

describe("OTPSentModal", () => {
  it("renders nothing when opened is false", () => {
    render(
      <OTPSentModal
        opened={false}
        onClose={vi.fn()}
        onGoToEmail={vi.fn()}
      />
    );
    expect(screen.queryByText(/OTP Code Sent/i)).not.toBeInTheDocument();
  });

  it("renders title, message and Go To Email button when opened", () => {
    render(
      <OTPSentModal
        opened
        onClose={vi.fn()}
        onGoToEmail={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: /OTP Code Sent/i })).toBeInTheDocument();
    expect(screen.getByText(/OTP Code has been sent to your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to email/i })).toBeInTheDocument();
  });

  it("calls onGoToEmail when Go To Email is clicked", async () => {
    const onGoToEmail = vi.fn();
    const user = userEvent.setup();
    render(
      <OTPSentModal opened onClose={vi.fn()} onGoToEmail={onGoToEmail} />
    );
    await user.click(screen.getByRole("button", { name: /go to email/i }));
    expect(onGoToEmail).toHaveBeenCalledTimes(1);
  });
});
