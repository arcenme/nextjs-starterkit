---
name: create-integration-test
description: Create Vitest integration tests for feature pages, forms, and complete user workflows - use this for complex UI, NOT for unit testing
---

## When to use this skill

Use this skill for **integration tests** that test how multiple units work together:

✅ **Use integration tests for:**
- Feature pages with forms (`src/features/*/page.tsx` or `src/features/*/_components/*.tsx`)
- Complex forms with React Hook Form + Zod
- Complete user workflows (login → dashboard, signup → onboarding)
- Database operations with real queries
- External API integrations

❌ **Don't use for (create unit tests instead):**
- Server actions alone
- Simple utility functions
- Type schemas
- Basic hooks

## Test file locations

```
src/__tests__/integration/
  features/         # Full feature flows
    login.test.tsx  # Login form + validation + API + redirect
    signup.test.tsx # Signup flow
  database/         # Database operations
    users.test.ts   # User CRUD operations
  lib/              # External service integration
    storage.test.ts # S3, email services
```

## Import pattern

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'
```

## Feature page test example

```typescript
describe('Login Page Integration', () => {
  it('completes full login flow', async () => {
    render(<LoginForm />)

    // Fill form
    await userEvent.type(screen.getByLabel(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabel(/password/i), 'password123')

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // Verify API called and navigation happens
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      })
    })
  })
})
```

## Mocking strategy

**Mock external boundaries only:**

```typescript
// Mock external services
vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: vi.fn() } }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

// Use real internal code
import { validateInput } from '@/lib/validation'  // Real implementation
```

## Running tests

```bash
# Run all integration tests
pnpm test:run -- src/__tests__/integration/

# Run specific test
pnpm test:run -- src/__tests__/integration/features/login.test.tsx
```

## Key principles

1. **Test complete flows** - Form → validation → action → result
2. **Mock only external** - Database, APIs, external SDKs
3. **Use real internal code** - Components, validation, utilities
4. **Verify integration points** - Check that actions are called correctly