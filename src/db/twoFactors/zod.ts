import { z } from 'zod'

export const TwoFactorSchema = z.object({
  id: z.string().trim().min(1),
  secret: z.string().trim().min(1),
  backupCodes: z.string().trim().min(1),
  userId: z.string().trim().min(1),
})
