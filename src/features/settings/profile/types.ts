import { z } from 'zod'
import { IMAGE_CONFIG } from '@/constants/image'
import { UserSchema } from '@/db/users/zod'

export const UpdateProfileSchema = z.object({
  name: UserSchema.shape.name,
  image: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        return val.startsWith('data:image/')
      },
      { message: 'Invalid image format' }
    )
    .refine(
      (val) => {
        if (!val || val === '') return true

        const mimeMatch = val.match(/data:(image\/[a-z]+);/)
        if (!mimeMatch) return false

        return IMAGE_CONFIG.ACCEPTED_MIME.includes(mimeMatch[1])
      },
      { message: 'Only .jpg, .jpeg, .png and .webp formats are supported' }
    )
    .refine(
      (val) => {
        if (!val || val === '') return true

        // Calculate base64 size
        // Remove data URL prefix to get pure base64
        const base64 = val.split(',')[1]
        if (!base64) return false

        // Calculate actual file size from base64
        // Base64 adds ~33% overhead, so we calculate: (base64.length * 3) / 4
        const sizeInBytes = (base64.length * 3) / 4

        // Account for padding
        const padding = (base64.match(/=/g) || []).length
        const actualSize = sizeInBytes - padding

        return actualSize <= IMAGE_CONFIG.MAX_SIZE
      },
      { message: 'Image must be less than 2MB' }
    ),
})

export const ChangeEmailSchema = UserSchema.pick({
  email: true,
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type ChangeEmailInput = z.infer<typeof ChangeEmailSchema>
