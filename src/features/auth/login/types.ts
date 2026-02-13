import { z } from 'zod'
import { UserSchema } from '@/db/users/zod'

export const LoginSchema = UserSchema.pick({
  email: true,
}).extend({
  password: z.string().trim().min(8).max(128),
})

export type LoginInput = z.infer<typeof LoginSchema>
