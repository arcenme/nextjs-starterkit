import { z } from 'zod'

export const VerificationSchema = z.object({
  id: z.string().trim().min(1),
  identifier: z.string().trim().min(1),
  value: z.string().trim().min(1).max(255),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Verification = z.infer<typeof VerificationSchema>
