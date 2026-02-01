import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { OTPDeliveryModal } from "../OTPDeliveryModal";

vi.mock("@/app/assets/asset", () => ({
  phoneIcon: "/phone.png",
  emailIcon: "/email.png",
  expatriateIcon: "/exp.png",
}));

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} />
  ),
}));

describe("OTPDeliveryModal", () => {
  it("renders nothing when opened is false", () => {
    render(
      <OTPDeliveryModal
        opened={false}
        onClose={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    expect(screen.queryByText(/Send Otp/i)).not.toBeInTheDocument();
  });

  it("renders title, options and Continue when opened", () => {
    render(
      <OTPDeliveryModal opened onClose={vi.fn()} onContinue={vi.fn()} />
    );
    expect(screen.getByRole("heading", { name: /Send Otp/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send to my Phone Number/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send to my Mail/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
  });

  it("enables Continue when a method is selected", async () => {
    const user = userEvent.setup();
    render(
      <OTPDeliveryModal opened onClose={vi.fn()} onContinue={vi.fn()} />
    );
    await user.click(screen.getByRole("button", { name: /Send to my Phone Number/i }));
    expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
  });

  it("calls onContinue with the selected method when Continue is clicked", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();
    render(
      <OTPDeliveryModal opened onClose={vi.fn()} onContinue={onContinue} />
    );
    await user.click(screen.getByRole("button", { name: /Send to my Mail/i }));
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    expect(onContinue).toHaveBeenCalledWith("email");
  });
});
