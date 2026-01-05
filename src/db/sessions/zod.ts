import { z } from 'zod'

export const SessionSchema = z.object({
  id: z.string().trim().min(1),
  expiresAt: z.date(),
  token: z.string().trim().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  ipAddress: z.string().trim().optional(),
  userAgent: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})

export type Session = z.infer<typeof SessionSchema>
