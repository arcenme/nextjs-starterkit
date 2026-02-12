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

```bash
npm run test                   # Run tests in watch mode
npm run test:run               # Run tests once (CI)
npm run test:run -- src/__tests__/components/button.test.tsx  # Single test file
npm run test -- -t "test name"             # Run specific test by name
npm run test:coverage          # Run tests with coverage
npm run test:ui                # Open Vitest UI
```

#### Test Structure

All tests are organized in `src/__tests__/` with separate folders for **unit** and **integration** tests:

```
src/__tests__/
  unit/                        # Unit tests (isolated, fast)
    components/                # UI component tests
      button.test.tsx
    hooks/                     # React hook tests
      use-mobile.test.ts
    lib/                       # Utility function tests
      utils.test.ts
    features/                  # Feature component tests (isolated)
      login/
        _components/
          login-form.test.tsx
  integration/                 # Integration tests (multiple units)
    features/                  # Full feature flows
      login.test.tsx           # Form + validation + API + navigation
    database/                  # Database integration tests
      users.test.ts            # Real Drizzle queries (mocked)
    lib/                       # External service integration
      storage.test.ts          # S3, email, etc.
```

**Unit vs Integration Tests:**

- **Unit tests**: Test single units in isolation, mock all dependencies
  - Fast, focused, easy to debug
  - Located in `unit/` folder
  - Example: Testing `<Button>` click handler

- **Integration tests**: Test multiple units working together
  - Slower, test real interactions with mocked external services
  - Located in `integration/` folder  
  - Example: Testing login form → validation → API call → redirect flow

Import testing utilities from `@/lib/vitest`:

```typescript
import { render, screen, userEvent, vi } from '@/lib/vitest'
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
  __tests__/                   # Test files organized by type
    unit/                      # Unit tests (isolated, fast)
      components/              # UI component tests
      hooks/                   # React hook tests
      lib/                     # Utility function tests
      features/                # Feature component tests
    integration/               # Integration tests (multiple units)
      features/                # Full feature flows
      database/                # Database integration tests
      lib/                     # External service integration
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

## Pre-commit Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No secrets or env files committed
- [ ] Commit messages follow conventional format (`feat:`, `fix:`, etc.)
