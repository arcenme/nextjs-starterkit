'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { returnValidationErrors } from 'next-safe-action'
import { IMAGE_CONFIG } from '@/constants/storage'
import {
  ChangeEmailSchema,
  GenerateAvatarPresignedUrlSchema,
  UpdateProfileSchema,
} from '@/features/settings/profile/types'
import { auth } from '@/lib/auth'
import { authAction } from '@/lib/safe-action'
import {
  deleteObject,
  extractKeyFromUrl,
  generatePresignedUrl,
  generateRandomKey,
  getPublicUrl,
  StorageError,
  validateFile,
} from '@/lib/storage'

export const generateAvatarPresignedUrlAction = authAction
  .metadata({ actionName: 'generateAvatarPresignedUrl' })
  .inputSchema(GenerateAvatarPresignedUrlSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      validateFile({
        filename: parsedInput.filename,
        mimeType: parsedInput.fileType,
        fileSize: parsedInput.fileSize,
        config: IMAGE_CONFIG,
      })

      const key = generateRandomKey({
        filename: parsedInput.filename,
        visibility: 'public',
        path: `avatars/${ctx.user.id}`,
        config: IMAGE_CONFIG,
      })

      const presignedUrl = await generatePresignedUrl({
        key,
        fileType: parsedInput.fileType,
        fileSize: parsedInput.fileSize,
        checksum: parsedInput.checksum,
        config: IMAGE_CONFIG,
        expiresInMinutes: 5,
        isPublic: true,
      })

      return {
        presignedUrl,
        key,
        publicUrl: getPublicUrl(key),
      }
    } catch (error) {
      if (error instanceof StorageError) {
        returnValidationErrors(GenerateAvatarPresignedUrlSchema, {
          _errors: [error.message],
        })
      }
    }
  })

export const updateProfileAction = authAction
  .metadata({ actionName: 'updateProfile' })
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const oldImageUrl = ctx.user.image

    try {
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          name: parsedInput.name,
          image: parsedInput.imageUrl ?? null,
        },
      })

      // Delete old avatar if exists and different from new one
      if (oldImageUrl && oldImageUrl !== parsedInput.imageUrl) {
        const oldKey = extractKeyFromUrl(oldImageUrl)

        if (oldKey) {
          // Delete in background - don't block response
          deleteObject({ key: oldKey }).catch((error) => {
            console.error('[updateProfile] Failed to delete old avatar:', {
              key: oldKey,
              error: error instanceof Error ? error.message : error,
            })
          })
        }
      }

      return { success: true }
    } catch (error) {
      if (error instanceof APIError) {
        returnValidationErrors(UpdateProfileSchema, {
          _errors: [error.message],
        })
      }
    }
  })

export const changeEmailAction = authAction
  .metadata({ actionName: 'changeEmail' })
  .inputSchema(ChangeEmailSchema)
  .action(async ({ parsedInput }) => {
    await auth.api
      .changeEmail({
        headers: await headers(),
        body: {
          newEmail: parsedInput.email,
          callbackURL: '/email-verified',
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(ChangeEmailSchema, {
            email: { _errors: [error.message] },
          })
        }
      })
  })
