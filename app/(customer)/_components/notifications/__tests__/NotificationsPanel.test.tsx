import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils";
import NotificationsPanel from "../NotificationsPanel";

describe("NotificationsPanel", () => {
  it("renders Notifications heading and View all link", () => {
    render(<NotificationsPanel />);
    expect(screen.getByRole("heading", { name: /notifications/i })).toBeInTheDocument();
    const viewAll = screen.getByRole("link", { name: /view all/i });
    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveAttribute("href", "#");
  });

  it("uses viewAllHref when provided", () => {
    render(<NotificationsPanel viewAllHref="/notifications" />);
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/notifications"
    );
  });

  it("renders default notification items", () => {
    render(<NotificationsPanel />);
    expect(screen.getByText(/transfer completed/i)).toBeInTheDocument();
    expect(screen.getByText(/payment received/i)).toBeInTheDocument();
  });

  it("renders custom items when items prop is provided", () => {
    render(
      <NotificationsPanel
        items={[
          {
            title: "Custom alert",
            context: "Custom context",
            date: "Dec 1 2025",
            time: "2:00 pm",
          },
        ]}
      />
    );
    expect(screen.getByText("Custom alert")).toBeInTheDocument();
    expect(screen.getByText("Custom context")).toBeInTheDocument();
    expect(screen.queryByText(/transfer completed/i)).not.toBeInTheDocument();
  });
});
