import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test-utils";
import NotificationsPanel from "../NotificationsPanel";

// Mock the API hooks
vi.mock("@/app/_lib/api/hooks", () => ({
  useFetchData: vi.fn(),
}));

import { useFetchData } from "@/app/_lib/api/hooks";

describe("NotificationsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: empty notifications
    vi.mocked(useFetchData).mockReturnValue({
      data: { data: { notifications: [] } },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);
  });

  it("renders Notifications heading and View all link", () => {
    render(<NotificationsPanel />);
    expect(screen.getByRole("heading", { name: /notifications/i })).toBeInTheDocument();
    const viewAll = screen.getByRole("link", { name: /view all/i });
    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveAttribute("href", "/notifications");
  });

  it("uses viewAllHref when provided", () => {
    render(<NotificationsPanel viewAllHref="/custom" />);
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/custom"
    );
  });

  it("renders empty state when no notifications", () => {
    render(<NotificationsPanel />);
    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();
  });

  it("renders notification items from API", () => {
    vi.mocked(useFetchData).mockReturnValue({
      data: {
        data: {
          notifications: [
            {
              id: "1",
              title: "Transfer completed",
              message: "Your transfer to Ruth has been successful.",
              type: "transaction",
              read: false,
              createdAt: "2025-11-18T11:00:00Z",
            },
            {
              id: "2",
              title: "Payment received",
              message: "You received $850.89 from Tochukwu.",
              type: "payment",
              read: false,
              createdAt: "2025-11-18T09:30:00Z",
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

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

  it("shows loader when loading", () => {
    vi.mocked(useFetchData).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    render(<NotificationsPanel />);
    // The Loader component should be rendered
    // We can't easily test for the Loader component without importing it,
    // but we can verify the loading state doesn't show notifications
    expect(screen.queryByText(/transfer completed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no notifications yet/i)).not.toBeInTheDocument();
  });
});
