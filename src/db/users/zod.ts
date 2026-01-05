import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  email: z.email().trim().min(1),
  emailVerified: z.boolean().default(false),
  image: z.string().trim().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>
