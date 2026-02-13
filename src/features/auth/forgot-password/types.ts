import { z } from 'zod'

export const ForgotPasswordSchema = z.object({
  email: z.email().trim().min(1).max(255),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
