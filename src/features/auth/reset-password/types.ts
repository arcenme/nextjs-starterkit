import { z } from 'zod'
import { PasswordSchema } from '@/db/users/zod'

export const ResetPasswordSchema = z
  .object({
    newPassword: PasswordSchema,
    confirmPassword: z.string().trim().min(1, 'Please confirm your password'),
    token: z.string().trim().min(1).max(255),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
