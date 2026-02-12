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
  unit/                        # Unit tests (isolated logic)
    lib/                       # Utility functions (utils, password, etc.)
      utils.test.ts
    hooks/                     # Custom hooks
      use-mobile.test.ts
    components/                # Simple UI components ONLY
      button.test.tsx          # Basic components from src/components/ui/
    features/                  # Actions and types only (NOT UI components)
      login/
        actions.test.ts        # Server action logic
        types.test.ts          # Zod schema validation
  integration/                 # Integration tests (workflows)
    features/                  # Full feature pages and forms
      login.test.tsx           # Login form + validation + API + redirect
    database/                  # Database operations
      users.test.ts            # Drizzle query handlers
    lib/                       # External services
      storage.test.ts          # S3, email, etc.
```

**Testing Strategy:**

| Type | Use For | Location |
|------|---------|----------|
| **Unit tests** | Actions, types, utils, hooks, simple components | `src/__tests__/unit/` |
| **Integration tests** | Feature pages, complex forms, workflows | `src/__tests__/integration/` |

**Examples:**
- ✅ Unit test: `cn()` utility, `useMobile()` hook, `loginAction()` logic
- ✅ Integration test: Login page with React Hook Form, database operations
- ❌ Don't unit test: Complex forms in `features/*/_components/` (use integration tests)

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
    unit/                      # Unit tests (isolated logic)
      lib/                     # Utility functions (utils, password, etc.)
      hooks/                   # Custom hooks
      components/              # Simple UI components ONLY
      features/                # Actions and types only (NOT UI components)
    integration/               # Integration tests (workflows)
      features/                # Full feature pages and forms
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

## Skills

This project includes custom skills for common tasks. Skills are discovered automatically by OpenCode from `.agents/skills/` directory.

### Available Skills

- **create-unit-test** - Generate Vitest unit tests following project conventions
  - Trigger: Type `/skill:create-unit-test` in chat
  - Creates tests in `src/__tests__/unit/` with proper structure
  - Location: `.agents/skills/create-unit-test/SKILL.md`

- **create-integration-test** - Generate Vitest integration tests for feature flows
  - Trigger: Type `/skill:create-integration-test` in chat
  - Creates tests in `src/__tests__/integration/` for testing multiple units together
  - Location: `.agents/skills/create-integration-test/SKILL.md`

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
