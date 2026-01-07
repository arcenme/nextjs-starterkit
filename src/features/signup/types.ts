import z from 'zod'
import { UserSchema } from '@/db/users/zod'

export const SignUpSchema = UserSchema.pick({
  name: true,
  email: true,
})
  .extend({
    password: z.string().trim().min(8).max(128),
    confirmPassword: z.string().trim().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpInput = z.infer<typeof SignUpSchema>
