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
import { loginAction } from '@/features/login/actions'

vi.mock('@/lib/auth', () => ({
  auth: { api: { signInEmail: vi.fn() } }
}))

describe('loginAction', () => {
  it('validates input before processing', async () => {
    const result = await loginAction({ email: 'invalid', password: '123' })
    expect(result.validationErrors).toBeDefined()
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

## Key principles

1. **Fast and isolated** - Mock all dependencies
2. **No complex UI** - Forms with React Hook Form are integration tests
3. **Test logic, not integration** - Focus on single units