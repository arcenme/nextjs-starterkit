import { z } from 'zod'

export const AccountSchema = z.object({
  id: z.string().trim().min(1),
  accountId: z.string().trim().min(1),
  providerId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  accessToken: z.string().trim().optional().nullable(),
  refreshToken: z.string().trim().optional(),
  idToken: z.string().trim().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().trim().optional(),
  password: z.string().trim().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Account = z.infer<typeof AccountSchema>
