import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import FxTransactionTypeCard from "../FxTransactionTypeCard";
import { User } from "lucide-react";

describe("FxTransactionTypeCard", () => {
  it("renders title and description", () => {
    render(
      <FxTransactionTypeCard
        icon={<User />}
        title="I am going on a Vacation"
        description="Buy FX to cover your travel, accommodation"
      />
    );
    expect(screen.getByRole("heading", { name: /vacation/i })).toBeInTheDocument();
    expect(screen.getByText(/buy fx to cover your travel/i)).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(
      <FxTransactionTypeCard
        icon={<User />}
        title="Vacation"
        description="Travel"
        href="/fx/vacation"
      />
    );
    const link = screen.getByRole("link", { name: /vacation/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/fx/vacation");
  });

  it("renders as a button when href is not provided", () => {
    render(
      <FxTransactionTypeCard
        icon={<User />}
        title="Vacation"
        description="Travel"
      />
    );
    expect(screen.getByRole("button", { name: /vacation/i })).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <FxTransactionTypeCard
        icon={<User />}
        title="Vacation"
        description="Travel"
        onClick={onClick}
      />
    );
    await user.click(screen.getByRole("button", { name: /vacation/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
