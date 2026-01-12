# Testing Guide

This guide covers testing setup, best practices, and common patterns for the SohCahToa Digital FX Platform frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Mantine Components](#testing-mantine-components)
- [Testing TanStack Query](#testing-tanstack-query)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses a modern testing stack:

- **[Vitest](https://vitest.dev/)** - Fast unit test framework (Vite-powered)
- **[React Testing Library](https://testing-library.com/react)** - Component testing utilities
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** - Custom DOM matchers
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/)** - User interaction simulation

### Key Features

- ✅ Automatic provider setup (MantineProvider + QueryClientProvider)
- ✅ Pre-configured test environment with jsdom
- ✅ CSS and asset handling
- ✅ TypeScript support
- ✅ Coverage reporting
- ✅ Watch mode for development

## Setup

### Configuration Files

#### `vitest.config.ts`

Main Vitest configuration file that sets up:
- React plugin for JSX support
- jsdom environment for DOM testing
- Path aliases (`@/` resolves to project root)
- CSS processing
- Coverage settings

#### `vitest.setup.ts`

Test setup file that runs before each test file:
- Imports `@testing-library/jest-dom` matchers
- Mocks CSS imports
- Mocks `window.matchMedia` for Mantine compatibility
- Sets up automatic cleanup

#### `test-utils.tsx`

Custom testing utilities that provide:
- `render()` function with all providers pre-configured
- `createTestQueryClient()` helper for isolated query clients
- Re-exports of all Testing Library utilities

### Import Path

Always import testing utilities from `@/test-utils`:

```tsx
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
```

**Do NOT** import directly from `@testing-library/react` - use `@/test-utils` instead to ensure providers are set up correctly.

## Running Tests

### Watch Mode (Development)

```bash
npm test
```

Runs tests in watch mode - tests re-run automatically when files change.

### Run Once (CI/CD)

```bash
npm run test:run
```

Runs all tests once and exits. Use this in CI/CD pipelines.

### Interactive UI

```bash
npm run test:ui
```

Opens Vitest UI in your browser for an interactive testing experience.

### Coverage Report

```bash
npm run test:coverage
```

Generates a coverage report showing which code is covered by tests. Reports are available in:
- Terminal output
- `coverage/` directory (HTML report)

## Writing Tests

### Basic Test Structure

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Test File Naming

- Place test files next to the component: `MyComponent.test.tsx`
- Or in a `__tests__` directory: `__tests__/MyComponent.test.tsx`
- Vitest automatically discovers files matching `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`

### Querying Elements

Use React Testing Library's query methods (available via `screen`):

```tsx
// Recommended: Queries that mirror user behavior
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')

// Fallback queries (use sparingly)
screen.getByTestId('submit-button')
screen.getByDisplayValue('test@example.com')
```

**Priority Order:**
1. `getByRole` - Most accessible, mirrors user behavior
2. `getByLabelText` - For form inputs
3. `getByPlaceholderText` - For inputs without labels
4. `getByText` - For text content
5. `getByTestId` - Last resort, use sparingly

### Assertions

Use `@testing-library/jest-dom` matchers:

```tsx
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveClass('active')
expect(element).toHaveTextContent('Hello')
expect(element).toHaveAttribute('aria-label', 'Close')
expect(input).toHaveValue('test@example.com')
expect(button).toBeDisabled()
expect(button).toBeEnabled()
```

## Testing Mantine Components

Mantine components work out of the box - no additional setup needed!

### Example: Testing a Button

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from '@mantine/core'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant and color props', () => {
    render(<Button variant="filled" color="blue">Submit</Button>)
    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeInTheDocument()
    // Mantine applies classes internally, test behavior not implementation
  })
})
```

### Example: Testing Forms

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { TextInput, Button } from '@mantine/core'

describe('Login Form', () => {
  it('allows user to enter email and password', async () => {
    const user = userEvent.setup()
    
    render(
      <form>
        <TextInput label="Email" name="email" />
        <TextInput label="Password" type="password" name="password" />
        <Button type="submit">Login</Button>
      </form>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })
})
```

### Example: Testing Modals

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Modal, Button } from '@mantine/core'

describe('Confirmation Modal', () => {
  it('opens and closes modal', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal opened={true} onClose={() => {}} title="Confirm Action">
        <p>Are you sure?</p>
        <Button>Confirm</Button>
      </Modal>
    )

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })
})
```

## Testing TanStack Query

### Basic Query Testing

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { useQuery } from '@tanstack/react-query'

function DataDisplay() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      return response.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  return <div>{data?.name}</div>
}

describe('DataDisplay', () => {
  it('shows loading state initially', () => {
    render(<DataDisplay />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays data after loading', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ name: 'John Doe' }),
      })
    ) as any

    render(<DataDisplay />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})
```

### Testing Mutations

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@mantine/core'

function CreateUser() {
  const mutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      return response.json()
    },
  })

  return (
    <div>
      <Button
        onClick={() => mutation.mutate('John Doe')}
        loading={mutation.isPending}
      >
        Create User
      </Button>
      {mutation.isSuccess && <div>User created!</div>}
    </div>
  )
}

describe('CreateUser', () => {
  it('creates user on button click', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'John Doe' }),
      })
    )
    global.fetch = mockFetch as any

    render(<CreateUser />)

    const button = screen.getByRole('button', { name: /create user/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('User created!')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'John Doe' }),
    })
  })
})
```

### Using Custom QueryClient

For isolated tests or custom query behavior:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { createTestQueryClient } from '@/test-utils'
import { QueryClient } from '@tanstack/react-query'

describe('Component with Custom QueryClient', () => {
  it('uses custom query client', () => {
    const customClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3, // Override default
        },
      },
    })

    render(<MyComponent />, { queryClient: customClient })
    // Test your component
  })
})
```

## Best Practices

### 1. Test User Behavior, Not Implementation

✅ **Good:**
```tsx
it('submits form when submit button is clicked', async () => {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  
  render(<Form onSubmit={onSubmit} />)
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
})
```

❌ **Bad:**
```tsx
it('calls onSubmit prop', () => {
  const onSubmit = vi.fn()
  const { container } = render(<Form onSubmit={onSubmit} />)
  const form = container.querySelector('form')
  form.dispatchEvent(new Event('submit'))
  // Testing implementation details, not user behavior
})
```

### 2. Use Accessible Queries

✅ **Good:**
```tsx
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email address')
```

❌ **Bad:**
```tsx
screen.getByTestId('submit-btn') // Only if absolutely necessary
container.querySelector('.submit-button') // Avoid DOM queries
```

### 3. Keep Tests Focused

Each test should verify one behavior:

```tsx
describe('UserProfile', () => {
  it('displays user name', () => {
    render(<UserProfile name="John" />)
    expect(screen.getByText('John')).toBeInTheDocument()
  })

  it('displays user email', () => {
    render(<UserProfile email="john@example.com" />)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  // Not: "displays user name and email" - split into two tests
})
```

### 4. Use Descriptive Test Names

```tsx
// ✅ Good
it('shows error message when email is invalid', () => {})
it('disables submit button when form is empty', () => {})

// ❌ Bad
it('works correctly', () => {})
it('test 1', () => {})
```

### 5. Clean Up After Tests

The setup file handles automatic cleanup, but for manual cleanup:

```tsx
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  // Additional cleanup if needed
})
```

### 6. Mock External Dependencies

```tsx
import { vi } from 'vitest'

// Mock API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' }),
  })
) as any

// Mock modules
vi.mock('@/lib/api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1 })),
}))
```

## Common Patterns

### Testing Async Components

```tsx
import { waitFor } from '@/test-utils'

it('loads data asynchronously', async () => {
  render(<AsyncComponent />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
  
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```

### Testing Form Validation

```tsx
it('shows validation error for invalid email', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  const emailInput = screen.getByLabelText(/email/i)
  await user.type(emailInput, 'invalid-email')
  await user.tab() // Trigger blur
  
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

### Testing Conditional Rendering

```tsx
it('shows content when user is authenticated', () => {
  render(<Dashboard user={{ id: 1, name: 'John' }} />)
  expect(screen.getByText('Welcome, John')).toBeInTheDocument()
})

it('shows login form when user is not authenticated', () => {
  render(<Dashboard user={null} />)
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
})
```

### Testing Error States

```tsx
it('displays error message on API failure', async () => {
  global.fetch = vi.fn(() => Promise.reject(new Error('API Error'))) as any
  
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Tests Fail with "window.matchMedia is not a function"

This is already handled in `vitest.setup.ts`. If you see this error, ensure `vitest.setup.ts` is properly configured in `vitest.config.ts`.

### Mantine Components Not Rendering

Ensure you're importing from `@/test-utils`, not directly from `@testing-library/react`:

```tsx
// ✅ Correct
import { render } from '@/test-utils'

// ❌ Wrong
import { render } from '@testing-library/react'
```

### TanStack Query Not Working in Tests

The test utilities automatically provide a QueryClient. If you need custom behavior:

```tsx
import { createTestQueryClient } from '@/test-utils'

const customClient = createTestQueryClient()
render(<Component />, { queryClient: customClient })
```

### CSS Imports Causing Errors

CSS imports are mocked in `vitest.setup.ts`. If you add new CSS files, you may need to add them to the mock list.

### Tests Running Slowly

- Use `test:run` instead of watch mode in CI/CD
- Consider using `vi.useFakeTimers()` for time-dependent tests
- Mock expensive operations (API calls, file I/O)

### Coverage Not Showing

Ensure `@vitest/coverage-v8` is installed and run:

```bash
npm run test:coverage
```

Check the `coverage/` directory for HTML reports.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Documentation](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mantine Testing Examples](https://mantine.dev/)
- [TanStack Query Testing Guide](https://tanstack.com/query/latest/docs/react/guides/testing)

