import { z } from 'zod'

export const RevokeSessionSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required')
    .max(100, 'Token is too long')
    .regex(/^[A-Za-z0-9._-]+$/, 'Invalid token format'),
})

export const RevokeOtherSessionsSchema = z.object({
  password: z.string().min(1, 'Password is required').max(128),
})

export type RevokeSessionInput = z.infer<typeof RevokeSessionSchema>
export type RevokeOtherSessionsInput = z.infer<typeof RevokeOtherSessionsSchema>
