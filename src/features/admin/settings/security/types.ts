import { z } from 'zod'
import { PasswordSchema } from '@/db/users/zod'

export const UpdatePasswordSchema = z
  .object({
    newPassword: PasswordSchema,
    confirmPassword: z.string().trim().min(1, 'Please confirm your password'),
    currentPassword: z
      .string()
      .trim()
      .min(1, 'Please enter your current password')
      .max(128),
    revokeOtherSessions: z.boolean().default(false),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const TwoFactorPasswordSchema = z.object({
  password: z.string().trim().min(1, 'Please enter your password'),
})

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>
export type TwoFactorPasswordInput = z.infer<typeof TwoFactorPasswordSchema>
