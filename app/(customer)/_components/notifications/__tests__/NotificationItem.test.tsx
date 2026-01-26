import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import NotificationItem from "../NotificationItem";

describe("NotificationItem", () => {
  it("renders title, context, date and time", () => {
    render(
      <NotificationItem
        title="Transfer completed"
        context="Your transfer to Ruth has been successful."
        date="Nov 18 2025"
        time="11:00 am"
      />
    );
    expect(screen.getByRole("heading", { name: /transfer completed/i })).toBeInTheDocument();
    expect(screen.getByText(/your transfer to ruth has been successful/i)).toBeInTheDocument();
    expect(screen.getByText("Nov 18 2025")).toBeInTheDocument();
    expect(screen.getByText("11:00 am")).toBeInTheDocument();
  });

  it("shows Unread badge when status is unread", () => {
    render(
      <NotificationItem
        title="Transfer completed"
        context="Done."
        date="Nov 18 2025"
        time="11:00 am"
        status="unread"
      />
    );
    expect(screen.getByText("Unread")).toBeInTheDocument();
  });

  it("does not show Unread badge when status is read", () => {
    render(
      <NotificationItem
        title="Transfer completed"
        context="Done."
        date="Nov 18 2025"
        time="11:00 am"
        status="read"
      />
    );
    expect(screen.queryByText("Unread")).not.toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(
      <NotificationItem
        title="Transfer completed"
        context="Done."
        date="Nov 18 2025"
        time="11:00 am"
        href="/notifications/1"
      />
    );
    const link = screen.getByRole("link", { name: /transfer completed/i });
    expect(link).toHaveAttribute("href", "/notifications/1");
  });

  it("calls onClick when button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationItem
        title="Transfer completed"
        context="Done."
        date="Nov 18 2025"
        time="11:00 am"
        onClick={onClick}
      />
    );
    await user.click(screen.getByRole("button", { name: /transfer completed/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
