import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { OTPInput } from "../OTPInput";

describe("OTPInput", () => {
  it("renders OTP expires text and timer", () => {
    render(<OTPInput onComplete={vi.fn()} expiryMinutes={15} />);
    expect(screen.getByText(/OTP expires in/i)).toBeInTheDocument();
    expect(screen.getByText(/15:00/)).toBeInTheDocument();
  });

  it("renders maskedInfo when provided", () => {
    render(
      <OTPInput onComplete={vi.fn()} maskedInfo="Sent to ***@mail.com" />
    );
    expect(screen.getByText("Sent to ***@mail.com")).toBeInTheDocument();
  });

  it("renders Resend OTP button when onResend is provided", () => {
    render(<OTPInput onComplete={vi.fn()} onResend={vi.fn()} expiryMinutes={0} />);
    expect(screen.getByRole("button", { name: /resend otp/i })).toBeInTheDocument();
  });

  it("Resend button is enabled when timeLeft is 0", () => {
    render(<OTPInput onComplete={vi.fn()} onResend={vi.fn()} expiryMinutes={0} />);
    expect(screen.getByRole("button", { name: /resend otp/i })).toBeEnabled();
  });

  it("calls onResend when Resend OTP is clicked", async () => {
    const onResend = vi.fn();
    const user = userEvent.setup();
    render(<OTPInput onComplete={vi.fn()} onResend={onResend} expiryMinutes={0} />);
    await user.click(screen.getByRole("button", { name: /resend otp/i }));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete when pin is completed", async () => {
    const onComplete = vi.fn();
    render(<OTPInput onComplete={onComplete} length={6} />);
    const inputs = Array.from(document.querySelectorAll('input[autocomplete="one-time-code"]')) as HTMLInputElement[];
    expect(inputs.length).toBe(6);
    const user = userEvent.setup();
    for (let i = 0; i < 6; i++) {
      if (inputs[i]) {
        await user.type(inputs[i]!, (i + 1).toString());
      }
    }
    expect(onComplete).toHaveBeenCalledWith("123456");
  });
});
