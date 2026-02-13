import { z } from 'zod'
import { UserSchema } from '@/db/users/zod'

export const GenerateAvatarPresignedUrlSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename is too long'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().positive('File size must be positive'),
  checksum: z.string().length(44, 'Invalid checksum format'),
})

export const UpdateProfileSchema = z.object({
  name: UserSchema.shape.name,
  imageUrl: z.string().trim().optional(),
})

export const ChangeEmailSchema = UserSchema.pick({
  email: true,
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type ChangeEmailInput = z.infer<typeof ChangeEmailSchema>
