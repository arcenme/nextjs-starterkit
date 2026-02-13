---
name: create-unit-test
description: Create focused unit tests for server actions, hooks, and utilities - isolated business logic only
---

## When to use

✅ **Use for:**
- Server actions (`src/features/*/actions.ts`) - API calls, error handling
- Custom hooks (`src/hooks/*.ts`) - State management
- Utilities (`src/lib/utils.ts`, `storage.ts`, `ua-parser.ts`) - Pure functions

❌ **Don't use for:**
- UI components, forms, types/schemas, env config

## Location

```
src/__tests__/unit/
  features/**/actions.test.ts
  hooks/*.test.ts
  lib/*.test.ts
```

## Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { signUpAction } from '@/features/signup/actions'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth', () => ({
  auth: { api: { signUpEmail: vi.fn() } }
}))

describe('signUpAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls API with correct params', async () => {
    const { auth } = await import('@/lib/auth')
    auth.api.signUpEmail.mockResolvedValue({ user: { id: '1' } })
    
    await signUpAction({ parsedInput: { email: 'test@test.com', password: 'pass' } })
    
    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: { email: 'test@test.com', password: 'pass' }
    })
  })
})
```

## Common mocks

```typescript
vi.mock('@/lib/safe-action', () => ({
  safeAction: { metadata: () => ({ action: vi.fn((fn) => fn) }) }
}))
vi.mock('next-safe-action', () => ({ returnValidationErrors: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: { api: { signUpEmail: vi.fn() } } }))
```

## Principles

1. Test business logic, not frameworks (Zod, React, Next.js)
2. Mock all external dependencies
3. Fast (< 100ms per test)
4. Use `vi.clearAllMocks()` in beforeEach
5. Dynamic imports for mocked modules: `await import('@/lib/auth')`
