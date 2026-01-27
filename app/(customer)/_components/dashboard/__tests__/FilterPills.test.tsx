import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import FilterPills from "../FilterPills";

describe("FilterPills", () => {
  const items = [
    { id: "all", label: "All" },
    { id: "fx", label: "FX" },
    { id: "pta", label: "PTA" },
  ];

  it("renders all pills", () => {
    render(<FilterPills items={items} activeId="all" onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^fx$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pta$/i })).toBeInTheDocument();
  });

  it("calls onSelect with the pill id when clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FilterPills items={items} activeId="all" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /^fx$/i }));
    expect(onSelect).toHaveBeenCalledWith("fx");
  });

  it("applies active styles to the active pill", () => {
    render(<FilterPills items={items} activeId="pta" onSelect={vi.fn()} />);
    const pta = screen.getByRole("button", { name: /^pta$/i });
    expect(pta).toHaveClass("bg-primary-400", "text-white");
  });
});
