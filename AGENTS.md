# AGENTS.md

Next.js 16 + React 19 + TypeScript boilerplate with Better Auth, Drizzle ORM, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS v4, Radix UI primitives
- **Auth**: Better Auth with 2FA support
- **Database**: Drizzle ORM with PostgreSQL
- **Forms**: React Hook Form + Zod
- **Actions**: Next Safe Action
- **Testing**: Vitest + React Testing Library
- **Linting**: Biome 2.2.0
- **Commits**: Commitizen + Commitlint

## Build & Development Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Production build
npm run start                  # Start production server

# Linting & Formatting (Biome)
npm run lint                   # Check code style
npm run lint:fix               # Fix auto-fixable issues
npm run format                 # Format all files

# Database (Drizzle)
npm run db:pull                # Introspect database schema
npm run db:push                # Push schema changes
npm run db:generate            # Generate migrations
npm run db:migrate             # Run migrations
npm run db:studio              # Open Drizzle Studio

# Git
npm run commit                 # Commitizen prompt
```

### Testing (Vitest)

**Philosophy:** Integration tests = PRIMARY (comprehensive), Unit tests = SUPPLEMENTARY (business logic)

```bash
npm run test                   # Run all tests
npm run test:run               # Run once (CI)
npm run test:coverage          # With coverage
```

**Structure:**
```
src/__tests__/
  integration/                 # PRIMARY: Features, forms, workflows
    features/auth/login.test.tsx
    features/admin/settings/profile.test.tsx
  unit/                        # SUPPLEMENTARY: Actions, hooks, utilities
    features/login/actions.test.ts
    hooks/use-mobile.test.ts
    lib/utils.test.ts
```

**Strategy:**
| What | Type | Location |
|------|------|----------|
| Pages, forms, components | Integration | `integration/` |
| Server actions | Unit | `unit/features/**/actions.test.ts` |
| Hooks, utilities | Unit | `unit/hooks/`, `unit/lib/` |
| Zod schemas | None | Trust the library |

**vitest.config.ts:**
```typescript
test: {
  include: [
    'src/__tests__/integration/**/*.test.ts*',
    'src/__tests__/unit/features/**/actions.test.ts',
    'src/__tests__/unit/hooks/**/*.test.ts',
    'src/__tests__/unit/lib/**/*.test.ts',
  ],
  coverage: {
    include: ['src/features/**/actions.ts', 'src/db/**/handler.ts', 'src/hooks/**', 'src/lib/**'],
    exclude: ['src/lib/auth*.ts', 'src/lib/safe-action.ts', 'src/lib/email.ts', 'src/lib/env*.ts'],
  },
}
```

**Examples:**
```typescript
// Integration - Test complete flow
import { LoginForm } from '@/features/auth/login/_components/login-form'
describe('Login', () => {
  it('logs in user', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockSignIn).toHaveBeenCalled())
  })
})

// Unit - Test business logic
import { signUpAction } from '@/features/signup/actions'
vi.mock('server-only', () => ({}))
describe('signUpAction', () => {
  it('calls API', async () => {
    await signUpAction({ parsedInput: { email: 'test@test.com', password: 'pass' } })
    expect(auth.api.signUpEmail).toHaveBeenCalled()
  })
})
```

#### Test Structure

```
src/__tests__/
  integration/                 # PRIMARY: Full feature tests (pages, forms, workflows)
    features/
      auth/
        login.test.tsx         # Complete login flow
        signup.test.tsx
      admin/
        settings/
          profile.test.tsx     # Settings page with forms
    database/
      users.test.ts            # Database operations
    lib/
      storage.test.ts          # External service integration

  unit/                        # SUPPLEMENTARY: Business logic only
    features/
      login/
        actions.test.ts        # Server actions (API calls, error handling)
    hooks/
      use-mobile.test.ts       # Custom hooks
      use-initials.test.ts
    lib/
      utils.test.ts            # Pure utility functions
      storage.test.ts
      ua-parser.test.ts
```

#### Testing Strategy

**Integration Tests (Primary)**
- ✅ Use for: Pages, forms, components, complete workflows
- ✅ Test: User interactions, form submission, API integration, navigation
- ✅ Location: `src/__tests__/integration/`
- ✅ Coverage: Happy path, validation errors, API failures

**Unit Tests (Supplementary)**
- ✅ Use for: Server actions, hooks, utility functions
- ✅ Test: Business logic in isolation
- ✅ Location: `src/__tests__/unit/`
- ❌ Don't test: UI components, Zod schemas, env config

| What | Test Type | Why |
|------|-----------|-----|
| Feature pages | Integration | Test complete user flows |
| Forms with React Hook Form | Integration | Test validation + submission |
| UI components (modals, buttons) | Integration | Test in context |
| Server actions | Unit | Test business logic isolation |
| Custom hooks | Unit | Test state management |
| Utility functions | Unit | Test pure logic |
| Zod schemas | None | Trust the library |

#### Configuration

**vitest.config.ts** controls what tests run and what gets coverage:

```typescript
test: {
  include: [
    // Integration tests - comprehensive coverage
    'src/__tests__/integration/**/*.test.ts*',
    // Unit tests - business logic only
    'src/__tests__/unit/features/**/actions.test.ts',
    'src/__tests__/unit/hooks/**/*.test.ts',
    'src/__tests__/unit/lib/**/*.test.ts',
  ],
  coverage: {
    include: [
      'src/features/**/actions.ts',
      'src/db/**/handler.ts',
      'src/hooks/**',
      'src/lib/**',
    ],
    exclude: [
      'src/lib/auth.ts',
      'src/lib/auth-client.ts',
      'src/lib/safe-action.ts',
      'src/lib/email.ts',
      'src/lib/env*.ts',
    ],
  },
}
```

#### Writing Tests

**Integration Test Example:**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from '@/features/auth/login/_components/login-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: vi.fn() } }
}))

describe('Login Flow', () => {
  it('completes full login', async () => {
    render(<LoginForm />)
    
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password'
      })
    })
  })
})
```

**Unit Test Example:**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { signUpAction } from '@/features/signup/actions'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth', () => ({
  auth: { api: { signUpEmail: vi.fn() } }
}))

describe('signUpAction', () => {
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

## Project Structure

```
src/
  app/                         # Next.js App Router (route groups: (auth), (web))
  components/
    ui/                        # Base UI components
    shared/                    # Shared components
  features/                    # Feature-based modules
    login/
      index.tsx                # Feature entry
      actions.ts               # Server actions
      types.ts                 # Feature types
      _components/             # Private components
  db/                          # Database layer (schema.ts, handler.ts, zod.ts)
  lib/                         # Utilities (utils.ts with cn(), safe-action.ts)
  hooks/                       # Custom React hooks (useMobile.ts)
  constants/                   # App constants
  providers/                   # React context providers
  __tests__/
    integration/               # PRIMARY: Pages, forms, workflows
    unit/                      # SUPPLEMENTARY: Actions, hooks, utils
```

## Code Style Guidelines

### Imports

```typescript
// Order: React/Next → External → Internal → Types
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { User } from '@/db/users/schema'
```

### Formatting (Biome)

- **Indent**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: As needed (omit when not required)
- **Trailing commas**: ES5 style
- **Import organization**: Auto-organized by Biome
- **Class sorting**: Auto-sorted in className, cn(), clsx(), cva()

### Naming Conventions

- **Components**: PascalCase → `Button.tsx`, `UserProfile.tsx`
- **Hooks**: camelCase with `use` prefix → `useMobile.ts`
- **Utilities**: camelCase → `cn()`, `formatDate()`
- **Actions**: camelCase → `loginAction()`, `updateProfile()`
- **Types**: PascalCase → `UserProps`, `ButtonVariant`
- **Database**: lowercase directory, files as `schema.ts`, `handler.ts`, `zod.ts`
- **Private components**: Underscore prefix → `_components/`
- **Constants**: UPPER_SNAKE_CASE in `/constants` files

### TypeScript

```typescript
// Prefer explicit return types
export async function getUser(id: string): Promise<User> {
  // ...
}

// Use type imports
import type { ComponentProps } from 'react'

// Validate with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

### React Components

```typescript
function Button({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Button }
```

### Server Actions

```typescript
import { actionClient } from '@/lib/safe-action'

export const updateProfile = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    return { success: true }
  })
```

### Error Handling

```typescript
// Server actions
import { ActionError } from 'next-safe-action'

if (!user) {
  throw new ActionError('User not found')
}

// Components
import { toast } from 'sonner'

try {
  await updateProfile({ name: 'John' })
  toast.success('Profile updated')
} catch (error) {
  toast.error(error.message)
}
```

### Database Patterns

```typescript
// Schema
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Handler
export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

// Validation (zod.ts)
export const userSchema = z.object({
  email: z.string().email(),
})
```

## Rules & Constraints

1. **Always run `npm run lint` before committing** - Husky pre-commit hooks enforce this
2. **Use `cn()` utility** for all className merging
3. **Follow Biome formatting** - Single quotes, 2-space indent, as-needed semicolons
4. **No `console.log` in production** - Use proper error handling
5. **Use `use server`** directive in action files
6. **Environment variables** - Use `@t3-oss/env-nextjs` validation
7. **Images** - Use `next/image` with configured remotePatterns
8. **Icons** - Use `lucide-react`
9. **Forms** - Use React Hook Form + Zod with shadcn/ui patterns

## Skills

This project includes custom skills for common tasks. Skills are discovered automatically by OpenCode from `.agents/skills/` directory.

### Available Skills

- **create-integration-test** (PRIMARY) - Feature pages, forms, workflows
  - Location: `.agents/skills/create-integration-test/SKILL.md`

- **create-unit-test** (Supplementary) - Actions, hooks, utilities
  - Location: `.agents/skills/create-unit-test/SKILL.md`

**Usage:**
```
/skill:create-integration-test  # For pages, forms, components
/skill:create-unit-test         # For actions, hooks, utilities
```

### How to Use Skills

1. **Invoke a skill**: Type `/skill:create-unit-test` or `/skill:create-integration-test`
2. **Or ask directly**: Say "create a unit test for Button component"
3. **View documentation**: Check the SKILL.md in each skill folder

### Creating New Skills

To add a new skill:
1. Create folder: `.agents/skills/<skill-name>/`
2. Add `SKILL.md` with YAML frontmatter (name, description) and instructions
3. Update AGENTS.md documentation

## Pre-commit Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No secrets or env files committed
- [ ] Commit messages follow conventional format (`feat:`, `fix:`, etc.)
