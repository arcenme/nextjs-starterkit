---
name: create-integration-test
description: Create comprehensive integration tests for features, forms, and workflows - test how units work together
---

## When to use

✅ **Use for (PRIMARY testing strategy):**
- Feature pages (`src/app/**/page.tsx`)
- Form components (`src/features/*/_components/*-form.tsx`)
- UI components (modals, sidebars, navigation)
- Workflows (login → dashboard, signup → onboarding)
- Database operations, external APIs

❌ **Don't use for:**
- Server actions (use unit tests), utilities, hooks in isolation

## Location

```
src/__tests__/integration/
  features/auth/login.test.tsx
  features/admin/settings/profile.test.tsx
  database/users.test.ts
  lib/storage.test.ts
```

## Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from '@/features/auth/login/_components/login-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: vi.fn() } }
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('Login Flow', () => {
  it('completes full login', async () => {
    render(<LoginForm />)
    
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@test.com', password: 'password'
      })
    })
  })
})
```

## Mocking strategy

**Mock external boundaries only:**

```typescript
// ✅ Mock external
vi.mock('@/lib/auth-client', () => ({ authClient: { signIn: { email: vi.fn() } } }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

// ❌ Don't mock internal
import { Button } from '@/components/ui/button'  // Use real
import { validateInput } from '@/lib/validation'  // Use real
```

## Test coverage

- ✅ Happy path (successful flow)
- ✅ Validation errors
- ✅ API/network errors
- ✅ Edge cases (empty states, special chars)
- ✅ UI state changes (loading, disabled)
- ✅ Navigation/redirects

## Principles

1. Test complete flows: Form → validation → API → UI update
2. Mock only external (APIs, DBs, SDKs)
3. Use real internal components
4. Verify end-to-end behavior
