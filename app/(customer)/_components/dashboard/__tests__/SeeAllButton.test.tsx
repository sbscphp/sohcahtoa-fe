import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import SeeAllButton from "../SeeAllButton";

describe("SeeAllButton", () => {
  it("renders See all text", () => {
    render(<SeeAllButton onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: /see all/i })).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(<SeeAllButton href="/transactions" />);
    const link = screen.getByRole("link", { name: /see all/i });
    expect(link).toHaveAttribute("href", "/transactions");
  });

  it("calls onClick when button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<SeeAllButton onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /see all/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
