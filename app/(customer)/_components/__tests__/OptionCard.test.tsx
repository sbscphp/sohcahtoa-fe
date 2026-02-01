import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import OptionCard from "../OptionCard";
import { User } from "lucide-react";

describe("OptionCard", () => {
  it("renders title, description and CTA text", () => {
    render(
      <OptionCard
        icon={<User />}
        title="Quick transfer"
        description="Send money in minutes."
        ctaText="Get started"
      />
    );
    expect(screen.getByRole("heading", { name: /quick transfer/i })).toBeInTheDocument();
    expect(screen.getByText(/send money in minutes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(
      <OptionCard
        icon={<User />}
        title="Quick transfer"
        description="Send money."
        ctaText="Get started"
        href="/transfer"
      />
    );
    const link = screen.getByRole("link", { name: /get started/i });
    expect(link).toHaveAttribute("href", "/transfer");
  });

  it("calls onClick when CTA button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <OptionCard
        icon={<User />}
        title="Quick transfer"
        description="Send money."
        ctaText="Get started"
        onClick={onClick}
      />
    );
    await user.click(screen.getByRole("button", { name: /get started/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
