import z from 'zod'
import { PasswordSchema, UserSchema } from '@/db/users/zod'

export const SignUpSchema = UserSchema.pick({
  name: true,
  email: true,
})
  .extend({
    password: PasswordSchema,
    confirmPassword: z.string().trim().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpInput = z.infer<typeof SignUpSchema>
