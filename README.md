# SohCahToa Digital FX Platform - Frontend

> A secure, fully compliant digital foreign exchange platform aligned with Central Bank of Nigeria (CBN) guidelines.

## 📖 About

SohCahToa Digital FX Platform is an initiative designed to transform SohCahToa Limited's Bureau De Change operations into a secure, fully compliant digital foreign exchange platform aligned with Central Bank of Nigeria (CBN) guidelines.

The project delivers web, mobile, and back-office admin systems, enabling:

- **Customer and Agent Onboarding** - Robust KYC/AML compliance
- **Compliant FX Transactions** - Secure foreign exchange operations
- **Bank and CBN Integrations** - Seamless regulatory compliance
- **Real-time Compliance Monitoring** - Continuous regulatory adherence

This repository contains the **web frontend application** built with modern React technologies.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Mantine UI v8](https://mantine.dev/) - Comprehensive React components
- **State Management**: [TanStack Query v5](https://tanstack.com/query) - Powerful data synchronization
- **Styling**:
  - [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
  - Mantine Core Styles
- **Testing**:
  - [Vitest](https://vitest.dev/) - Fast unit test framework
  - [React Testing Library](https://testing-library.com/react) - Component testing utilities
- **Charts**: [Recharts](https://recharts.org/) & [Mantine Charts](https://mantine.dev/charts/getting-started/)
- **Date Handling**: [Day.js](https://day.js.org/)

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sohcahtoa-fe
```

2. Install dependencies:

```bash
npm install
```

## 🏃 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will automatically reload when you make changes to the code.

## 🧪 Testing

This project uses Vitest for testing with full support for Mantine UI and TanStack Query.

### Available Test Commands

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI (interactive)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Tests are automatically configured with:

- **MantineProvider** - All Mantine components work out of the box
- **QueryClientProvider** - TanStack Query hooks are fully supported
- **Custom render function** - Import from `@/test-utils` instead of `@testing-library/react`

Example test:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils";
import { Button } from "@mantine/core";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Test Utilities

The `test-utils.tsx` file provides:

- Custom `render` function with all providers pre-configured
- Re-exports of all Testing Library utilities
- `createTestQueryClient()` helper for isolated query client instances

## 📜 Available Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm run dev`           | Start development server      |
| `npm run build`         | Build for production          |
| `npm run start`         | Start production server       |
| `npm run lint`          | Run ESLint                    |
| `npm test`              | Run tests in watch mode       |
| `npm run test:run`      | Run tests once                |
| `npm run test:ui`       | Run tests with interactive UI |
| `npm run test:coverage` | Generate test coverage report |

## 📁 Project Structure

```
sohcahtoa-fe/
├── app/                    # Next.js App Router directory
│   ├── components/         # React components
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── *.test.tsx          # Test files
├── public/                 # Static assets
├── test-utils.tsx          # Testing utilities and providers
├── vitest.config.ts        # Vitest configuration
├── vitest.setup.ts         # Test setup and mocks
├── next.config.ts           # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Mantine UI Components

This project includes the following Mantine packages:

- `@mantine/core` - Core components
- `@mantine/charts` - Chart components
- `@mantine/code-highlight` - Code highlighting
- `@mantine/dates` - Date pickers
- `@mantine/dropzone` - File upload
- `@mantine/form` - Form management
- `@mantine/hooks` - Custom hooks
- `@mantine/modals` - Modal dialogs
- `@mantine/notifications` - Toast notifications

## 🔄 TanStack Query

TanStack Query is configured for efficient data fetching and caching. The test utilities automatically provide a QueryClient with test-friendly defaults (retries disabled, etc.).

## 🚢 Deployment

### Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and configure the build

### Other Platforms

This app can be deployed to any platform that supports Next.js:

- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Railway](https://railway.app/)
- [Docker](https://www.docker.com/)

## 📝 Code Style

- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode enabled
- **Formatting**: Follow Next.js and React best practices

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass (`npm run test:run`)
5. Submit a pull request

## 📄 License

[Add your license here]

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantine Documentation](https://mantine.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
