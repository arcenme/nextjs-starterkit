import { z } from 'zod'

export const ResetPasswordSchema = z
  .object({
    newPassword: z.string().trim().min(8).max(128),
    confirmPassword: z.string().trim().min(8).max(128),
    token: z.string().trim().min(1).max(255),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
