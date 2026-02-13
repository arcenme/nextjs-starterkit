import { z } from 'zod'

export const TotpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
  trustDevice: z.boolean(),
})
export const BackupCodeSchema = z.object({
  code: z.string().trim().min(1, 'Please enter a backup code'),
  trustDevice: z.boolean(),
})

export type TotpInput = z.infer<typeof TotpSchema>
export type BackupCodeInput = z.infer<typeof BackupCodeSchema>
