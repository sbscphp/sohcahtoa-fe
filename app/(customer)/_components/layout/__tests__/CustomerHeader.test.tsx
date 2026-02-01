import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import CustomerHeader from "../CustomerHeader";

describe("CustomerHeader", () => {
  it("renders notification badge and avatar", () => {
    render(
      <CustomerHeader collapsed={false} setCollapsed={vi.fn()} />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <CustomerHeader
        title="Dashboard"
        collapsed={false}
        setCollapsed={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
  });

  it("does not render title when not provided", () => {
    render(
      <CustomerHeader collapsed={false} setCollapsed={vi.fn()} />
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("calls setCollapsed when collapse button is clicked", async () => {
    const setCollapsed = vi.fn();
    const user = userEvent.setup();
    render(
      <CustomerHeader collapsed={false} setCollapsed={setCollapsed} />
    );
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]!);
    expect(setCollapsed).toHaveBeenCalled();
  });
});
