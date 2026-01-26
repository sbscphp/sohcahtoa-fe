import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test-utils";
import { BVNModal } from "../BVNModal";

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

describe("BVNModal", () => {
  it("renders first step: title, BVN input and Verify BVN button when opened", () => {
    render(
      <BVNModal opened onClose={vi.fn()} onVerified={vi.fn()} />
    );
    expect(screen.getByRole("heading", { name: /Let's Get you Started/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your BVN/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verify BVN/i })).toBeDisabled();
  });

  it("enables Verify BVN when 11 digits are entered", async () => {
    const user = userEvent.setup();
    render(
      <BVNModal opened onClose={vi.fn()} onVerified={vi.fn()} />
    );
    await user.type(screen.getByPlaceholderText(/Enter your BVN/i), "12345678901");
    expect(screen.getByRole("button", { name: /Verify BVN/i })).toBeEnabled();
  });

  it("strips non-digits and limits to 11 characters", async () => {
    const user = userEvent.setup();
    render(
      <BVNModal opened onClose={vi.fn()} onVerified={vi.fn()} />
    );
    const input = screen.getByPlaceholderText(/Enter your BVN/i);
    await user.type(input, "123abc456def78901");
    expect(input).toHaveValue("12345678901");
  });

  it("opens OTP delivery step when Verify BVN is clicked with 11 digits", async () => {
    const user = userEvent.setup();
    render(
      <BVNModal opened onClose={vi.fn()} onVerified={vi.fn()} />
    );
    await user.type(screen.getByPlaceholderText(/Enter your BVN/i), "12345678901");
    await user.click(screen.getByRole("button", { name: /Verify BVN/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Send Otp/i })).toBeInTheDocument();
    });
  });
});
