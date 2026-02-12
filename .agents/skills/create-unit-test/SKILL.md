---
name: create-unit-test
description: Create Vitest unit tests for actions, types, utils, hooks, and simple components - NOT for complex UI in features
---

## When to use this skill

Use this skill for **isolated, fast unit tests** that don't require complex mocking:

✅ **GOOD for unit tests:**
- Server actions (`src/features/*/actions.ts`)
- Type schemas and validation (`src/features/*/types.ts`, `src/db/*/zod.ts`)
- Utility functions (`src/lib/utils.ts`, `src/lib/password.ts`)
- Custom hooks (`src/hooks/*.ts`)
- Simple UI components (`src/components/ui/button.tsx`, `src/components/ui/input.tsx`)

❌ **NOT for unit tests (use integration tests instead):**
- Complex forms with React Hook Form
- Feature pages with multiple components
- Components with heavy external dependencies

## Test file locations

```
src/__tests__/unit/
  lib/              # Utility functions
    utils.test.ts
    password.test.ts
  hooks/            # Custom hooks
    use-mobile.test.ts
  components/       # Simple UI components
    button.test.tsx
  features/         # Actions and types only
    login/
      actions.test.ts    # Test server actions
      types.test.ts      # Test Zod schemas
```

## Import pattern

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/lib/vitest'
```

## Examples

### Testing a Server Action

```typescript
import { describe, it, expect, vi } from 'vitest'
import { signUpAction } from '@/features/signup/actions'
import { APIError } from 'better-auth'

// Mock server-only import to avoid import errors in tests
vi.mock('server-only', () => ({}))

// Mock all external dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}))

vi.mock('@/lib/safe-action', () => ({
  safeAction: {
    metadata: () => ({
      inputSchema: {},
      action: vi.fn().mockImplementation((fn) => fn),
    }),
  },
}))

vi.mock('next-safe-action', () => ({
  returnValidationErrors: vi.fn(),
}))

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    REDIRECT_AFTER_SIGN_IN: '/dashboard',
  },
}))

describe('signUpAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully processes valid sign-up data', async () => {
    const mockSession = { user: { id: '1', email: 'test@example.com' } }
    const mockAuth = await import('@/lib/auth')
    mockAuth.auth.api.signUpEmail.mockResolvedValue(mockSession)

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    await signUpAction({ parsedInput: input })

    expect(mockAuth.auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        callbackURL: '/dashboard',
      },
    })
  })

  it('handles APIError from auth service', async () => {
    const apiError = new APIError('BAD_REQUEST', 'Email already exists')
    const mockAuth = await import('@/lib/auth')
    const mockReturnValidationErrors = await import('next-safe-action')
    mockAuth.auth.api.signUpEmail.mockRejectedValue(apiError)

    const input = {
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    await signUpAction({ parsedInput: input })

    expect(mockReturnValidationErrors.returnValidationErrors).toHaveBeenCalled()
  })

  it('handles null session response', async () => {
    const mockAuth = await import('@/lib/auth')
    const mockReturnValidationErrors = await import('next-safe-action')
    mockAuth.auth.api.signUpEmail.mockResolvedValue(null)

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    await signUpAction({ parsedInput: input })

    expect(mockReturnValidationErrors.returnValidationErrors).toHaveBeenCalledWith(
      expect.anything(),
      { _errors: ['Invalid credentials'] }
    )
  })
})
```

### Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })
})
```

### Testing a Simple Component

```typescript
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'
import { render, screen } from '@/lib/vitest'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Running tests

```bash
# Run all unit tests
pnpm test:run -- src/__tests__/unit/

# Run specific test
pnpm test:run -- src/__tests__/unit/lib/utils.test.ts
```

## Handling server-only imports

Server actions often import `'server-only'` which causes errors in test environments. **Always mock it first:**

```typescript
// Mock server-only at the top of your test file
vi.mock('server-only', () => ({}))
```

## Common mocking patterns

### Safe Action Pattern
```typescript
vi.mock('@/lib/safe-action', () => ({
  safeAction: {
    metadata: () => ({
      inputSchema: {},
      action: vi.fn().mockImplementation((fn) => fn),
    }),
  },
}))
```

### Next Safe Action Pattern
```typescript
vi.mock('next-safe-action', () => ({
  returnValidationErrors: vi.fn(),
}))
```

### Auth Service Pattern
```typescript
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      // other auth methods
    },
  },
}))
```

### Constants Pattern
```typescript
vi.mock('@/constants/routes', () => ({
  ROUTES: {
    REDIRECT_AFTER_SIGN_IN: '/dashboard',
  },
}))
```

## Key principles

1. **Fast and isolated** - Mock all dependencies
2. **Mock server-only** - Always mock `'server-only'` import first
3. **No complex UI** - Forms with React Hook Form are integration tests
4. **Test logic, not integration** - Focus on single units
5. **Clear mocks** - Use `vi.clearAllMocks()` in beforeEach
6. **Dynamic imports** - Use `await import()` to access mocked modules in tests