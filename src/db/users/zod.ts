import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(125),
  email: z.email().trim().min(1).max(255),
  emailVerified: z.boolean().default(false),
  image: z.string().trim().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const PasswordSchema = z
  .string()
  .trim()
  .min(1, 'password is required')
  .min(8, 'password must be at least 8 characters')
  .max(128, 'password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export type User = z.infer<typeof UserSchema>
export type Password = z.infer<typeof PasswordSchema>
