import type { z } from 'zod'
import { UserSchema } from '@/db/users/zod'

export const ChangeEmailSchema = UserSchema.pick({
  email: true,
})

export type ChangeEmailInput = z.infer<typeof ChangeEmailSchema>
