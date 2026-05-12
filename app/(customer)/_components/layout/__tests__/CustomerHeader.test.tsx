import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import CustomerHeader from "../CustomerHeader";

// Mock the API hooks
vi.mock("@/app/_lib/api/hooks", () => ({
  useFetchData: vi.fn(),
}));

// Mock jotai
vi.mock("jotai", () => ({
  useAtomValue: vi.fn(() => ({
    profile: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
    },
    email: "test@example.com",
  })),
}));

// Mock Mantine hooks
vi.mock("@mantine/hooks", () => ({
  useMediaQuery: vi.fn(() => false),
}));

import { useFetchData } from "@/app/_lib/api/hooks";

describe("CustomerHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: no unread notifications
    vi.mocked(useFetchData).mockReturnValue({
      data: { data: { count: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);
  });

  it("renders notification badge when there are unread notifications", () => {
    vi.mocked(useFetchData).mockReturnValue({
      data: { data: { count: 2 } },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    render(
      <CustomerHeader collapsed={false} setCollapsed={vi.fn()} />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not render notification badge when there are no unread notifications", () => {
    vi.mocked(useFetchData).mockReturnValue({
      data: { data: { count: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    render(
      <CustomerHeader collapsed={false} setCollapsed={vi.fn()} />
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
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
