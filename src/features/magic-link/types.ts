import { z } from 'zod'

export const MagicLinkSchema = z.object({
  email: z
    .email()
    .trim()
    .min(1)
    .max(255)
    .transform((email) => email.toLowerCase()),
})

export type MagicLinkInput = z.infer<typeof MagicLinkSchema>
