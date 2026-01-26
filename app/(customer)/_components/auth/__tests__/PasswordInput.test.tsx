import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { PasswordInput } from "../PasswordInput";

describe("PasswordInput", () => {
  it("renders label and input", () => {
    const { container } = render(
      <PasswordInput label="Password" value="" onChange={vi.fn()} />
    );
    expect(screen.getByText(/password/i)).toBeInTheDocument();
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <PasswordInput label="Password" value="" onChange={onChange} placeholder="Enter password" />
    );
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(input, "secret");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows error when error prop is provided", () => {
    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={vi.fn()}
        error="Password is required"
      />
    );
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("toggles visibility when the eye button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PasswordInput label="Password" value="x" onChange={vi.fn()} />
    );
    let input = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    const toggle = screen.getByRole("button");
    await user.click(toggle);
    input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    await user.click(toggle);
    input = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });
});
