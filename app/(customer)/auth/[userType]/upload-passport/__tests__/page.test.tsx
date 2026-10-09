import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import UploadPassportPage from "../page";

const mockPush = vi.fn();
const mockUploadMutate = vi.fn();
const mockVerifyMutate = vi.fn();
const mockUseParams = vi.fn(() => ({ userType: "tourist" }));

const uploadPassportCallIndex = vi.hoisted(() => ({ current: 0 }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockUseParams(),
}));

vi.mock("@/app/_lib/api/hooks", () => ({
  useCreateData: () => {
    uploadPassportCallIndex.current += 1;
    const isUpload = uploadPassportCallIndex.current % 2 === 1;
    return {
      mutate: isUpload ? mockUploadMutate : mockVerifyMutate,
      isPending: false,
    };
  },
}));

vi.mock("@/app/(customer)/_services/customer-api", () => ({
  customerApi: {
    auth: {
      kyc: {
        passport: {
          upload: vi.fn(),
        },
      },
      tourist: {
        verifyPassport: vi.fn(),
      },
    },
  },
}));

vi.mock("@/app/_lib/api/error-handler", () => ({
  handleApiError: vi.fn(),
}));

vi.mock("@/app/(customer)/_components/auth/SecurityBadges", () => ({
  SecurityBadges: () => <div>Security Badges</div>,
}));

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
  options?: { skipFile?: boolean }
) {
  await user.type(screen.getByPlaceholderText(/enter first name/i), "Maria");
  await user.type(screen.getByPlaceholderText(/enter last name/i), "Zhang");
  await user.type(
    screen.getByPlaceholderText(/enter passport number/i),
    "A12345678"
  );

  if (!options?.skipFile) {
    const file = new File(["test"], "passport.pdf", {
      type: "application/pdf",
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      await user.upload(fileInput, file);
    }
  }
}

describe("Upload Passport Page - Tourist/Expatriate Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadPassportCallIndex.current = 0;
    mockUseParams.mockReturnValue({ userType: "tourist" });
    sessionStorage.clear();
    sessionStorage.setItem("userType", "tourist");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders name, passport number, and upload dropzone", () => {
    render(<UploadPassportPage />);
    expect(
      screen.getByPlaceholderText(/enter first name/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter last name/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter passport number/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
  });

  it("disables verify button when required fields are empty", () => {
    render(<UploadPassportPage />);
    const button = screen.getByRole("button", { name: /upload document/i });
    expect(button).toBeDisabled();
  });

  it("disables verify button when file is not uploaded", async () => {
    const user = userEvent.setup();
    render(<UploadPassportPage />);
    await fillRequiredFields(user, { skipFile: true });
    expect(
      screen.getByRole("button", { name: /upload document/i })
    ).toBeDisabled();
  });

  it("enables verify button when name, passport number, and file are provided", async () => {
    const user = userEvent.setup();
    render(<UploadPassportPage />);
    await fillRequiredFields(user);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /upload document/i })
      ).toBeEnabled();
    });
  });

  it("calls upload API then verify API with firstName and lastName", async () => {
    const user = userEvent.setup();

    mockUploadMutate.mockImplementation((_data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          passportDocumentUrl: "https://cloudinary.com/passport/abc123.jpg",
        },
      });
    });

    mockVerifyMutate.mockImplementation((_data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          verificationToken: "test-verification-token",
          firstName: "Maria",
          lastName: "Zhang",
          email: "maria@example.com",
          phoneNumber: "+34320518522",
          nationality: "Spain",
        },
      });
    });

    render(<UploadPassportPage />);
    await fillRequiredFields(user);

    await user.click(screen.getByRole("button", { name: /upload document/i }));

    await waitFor(() => {
      expect(mockUploadMutate).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockVerifyMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          passportNumber: "A12345678",
          passportDocumentUrl: "https://cloudinary.com/passport/abc123.jpg",
          firstName: "Maria",
          lastName: "Zhang",
        }),
        expect.any(Object)
      );
    });
  });

  it("stores verification token and user data in sessionStorage on successful verification", async () => {
    const user = userEvent.setup();

    mockUploadMutate.mockImplementation((_data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          passportDocumentUrl: "https://cloudinary.com/passport/abc123.jpg",
        },
      });
    });

    mockVerifyMutate.mockImplementation((_data, callbacks) => {
      callbacks.onSuccess({
        success: true,
        data: {
          verificationToken: "test-verification-token",
          firstName: "Maria",
          lastName: "Zhang",
          email: "maria@example.com",
          phoneNumber: "+34320518522",
          nationality: "Spain",
          address: "123 Test St",
        },
      });
    });

    render(<UploadPassportPage />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /upload document/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem("verificationToken")).toBe(
        "test-verification-token"
      );
      expect(sessionStorage.getItem("passportNumber")).toBe("A12345678");
      expect(sessionStorage.getItem("firstName")).toBe("Maria");
      expect(sessionStorage.getItem("lastName")).toBe("Zhang");
      expect(sessionStorage.getItem("email")).toBe("maria@example.com");
      expect(sessionStorage.getItem("nationality")).toBe("Spain");
    });
  });

  it("redirects to onboarding if userType is citizen", () => {
    mockUseParams.mockReturnValue({ userType: "citizen" });
    render(<UploadPassportPage />);
    expect(mockPush).toHaveBeenCalledWith("/auth/onboarding");
  });

  it("handles upload API error", async () => {
    const user = userEvent.setup();
    const { handleApiError } = await import("@/app/_lib/api/error-handler");

    mockUploadMutate.mockImplementation((_data, callbacks) => {
      callbacks.onError({
        message: "Upload failed",
        status: 400,
      });
    });

    render(<UploadPassportPage />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /upload document/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalled();
    });
  });
});
