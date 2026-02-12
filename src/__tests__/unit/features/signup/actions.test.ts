import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Mock server-only first (must be before importing action)
vi.mock('server-only', () => {
  return {}
})

// Mock other dependencies
const mockSignUpEmail = vi.fn()
const mockReturnValidationErrors = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: (...args: unknown[]) => mockSignUpEmail(...args),
    },
  },
}))

const mockUse = vi.fn()

vi.mock('next-safe-action', () => ({
  returnValidationErrors: (...args: unknown[]) =>
    mockReturnValidationErrors(...args),
  createSafeActionClient: () => ({
    metadata: () => ({
      inputSchema: () => ({
        // biome-ignore lint/complexity/noBannedTypes: type for mock is not important
        action: (fn: Function) => fn,
      }),
    }),
    use: (...args: unknown[]) => mockUse(...args),
  }),
}))

vi.mock('@/lib/safe-action', async () => {
  const actual =
    await vi.importActual<typeof import('next-safe-action')>('next-safe-action')
  return {
    safeAction: actual.createSafeActionClient({
      defineMetadataSchema() {
        return z.object({
          actionName: z.string().trim(),
        })
      },
    }),
    authAction: vi.fn(),
  }
})

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    REDIRECT_AFTER_SIGN_IN: '/dashboard',
  },
}))

// Import after mocks
import { signUpAction } from '@/features/signup/actions'

describe('signUpAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signUpEmail with correct parameters', async () => {
    mockSignUpEmail.mockResolvedValue({ token: 'abc123', user: { id: '1' } })

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    await signUpAction(input)

    expect(mockSignUpEmail).toHaveBeenCalledWith({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        callbackURL: '/dashboard',
      },
    })
  })

  it('handles API errors gracefully', async () => {
    class APIError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'APIError'
      }
    }

    mockSignUpEmail.mockRejectedValue(new APIError('Email already exists'))

    const input = {
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    await signUpAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalled()
  })

  it('returns validation errors for null response', async () => {
    mockSignUpEmail.mockResolvedValue(null)

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    await signUpAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Invalid credentials'],
    })
  })

  it('validates name field before processing', async () => {
    const invalidInput = {
      name: '',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    // The action should return validation errors for empty name
    const result = await signUpAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('name')
  })

  it('validates email format before processing', async () => {
    const invalidInput = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }

    // The action should return validation errors for invalid email
    const result = await signUpAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('email')
  })

  it('validates password requirements before processing', async () => {
    const invalidInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    }

    // The action should return validation errors for weak password
    const result = await signUpAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('password')
  })

  it('validates password confirmation match', async () => {
    const invalidInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    }

    // The action should return validation errors for mismatched passwords
    const result = await signUpAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('confirmPassword')
  })
})
