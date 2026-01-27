import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { UserTypeCard } from "../UserTypeCard";

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} />
  ),
}));

describe("UserTypeCard", () => {
  it("renders title and optional description", () => {
    render(
      <UserTypeCard
        icon="/citizen.png"
        title="Citizen"
        description="A Nigerian resident applying for FX"
        isSelected={false}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /citizen/i })).toBeInTheDocument();
    expect(screen.getByText(/a nigerian resident applying for fx/i)).toBeInTheDocument();
  });

  it("renders without description when not provided", () => {
    render(
      <UserTypeCard
        icon="/tourist.png"
        title="Tourist"
        isSelected={false}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /tourist/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <UserTypeCard
        icon="/citizen.png"
        title="Citizen"
        isSelected={false}
        onClick={onClick}
      />
    );
    await user.click(screen.getByRole("button", { name: /citizen/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies selected styles when isSelected is true", () => {
    render(
      <UserTypeCard
        icon="/citizen.png"
        title="Citizen"
        isSelected
        onClick={vi.fn()}
      />
    );
    const btn = screen.getByRole("button", { name: /citizen/i });
    expect(btn).toHaveClass("border-primary-400", "bg-bg-sidebar");
  });
});
