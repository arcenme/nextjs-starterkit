'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { XIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { IMAGE_CONFIG } from '@/constants/storage'
import {
  generateAvatarPresignedUrlAction,
  updateProfileAction,
} from '@/features/admin/settings/profile/actions'
import { UpdateProfileSchema } from '@/features/admin/settings/profile/types'
import { authClient } from '@/lib/auth-client'
import { calculateSHA256 } from '@/lib/utils'

export function ProfileDetailForm() {
  const { isPending, data, refetch } = authClient.useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isImageRemoved, setIsImageRemoved] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const { executeAsync: getUploadUrl } = useAction(
    generateAvatarPresignedUrlAction
  )

  const { form, action } = useHookFormAction(
    updateProfileAction,
    zodResolver(UpdateProfileSchema),
    {
      formProps: {
        defaultValues: {
          name: '',
          imageUrl: '',
        },
      },
      actionProps: {
        onSuccess: async () => {
          toast.success('Profile updated successfully')
          await refetch()
          // Reset states after successful update
          setSelectedFile(null)
          setImagePreview('')
          setIsImageRemoved(false)
        },
        onError: ({ error }) => {
          if (error.serverError) {
            toast.error(error.serverError)
          }
        },
      },
    }
  )

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    // Client-side validation
    if (!IMAGE_CONFIG.ACCEPTED_MIME.includes(file.type)) {
      form.setError('imageUrl', {
        type: 'pattern',
        message: 'Only .jpg, .jpeg, .png and .webp formats are supported',
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      form.setError('imageUrl', {
        type: 'max',
        message: 'Image must be less than 2MB',
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Clear any previous errors and removed state
    form.clearErrors('imageUrl')
    setIsImageRemoved(false)

    // Store file for upload on submit
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      form.setValue('imageUrl', 'pending', {
        shouldValidate: false,
        shouldDirty: true,
      })
    }
    reader.onerror = () => {
      form.setError('imageUrl', {
        type: 'manual',
        message: 'Failed to read image file',
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    // Mark image as removed (will delete on submit)
    setIsImageRemoved(true)
    setSelectedFile(null)
    setImagePreview('')
    form.setValue('imageUrl', '', { shouldValidate: true, shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleFormSubmit(values: { name: string; imageUrl?: string }) {
    try {
      let finalImageUrl: string | undefined

      // If user removed image, set to undefined (will be null in DB)
      if (isImageRemoved) {
        finalImageUrl = undefined
      }
      // If user selected new file, upload it
      else if (selectedFile) {
        setIsUploading(true)

        // 1. Calculate SHA-256 checksum
        const checksum = await calculateSHA256(selectedFile)

        // 2. Get presigned URL
        const result = await getUploadUrl({
          filename: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          checksum,
        })

        if (!result?.data) {
          throw new Error('Failed to get upload URL')
        }

        const { presignedUrl, publicUrl } = result.data

        // 3. Upload to S3/MinIO
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
            'Content-Length': selectedFile.size.toString(),
            'x-amz-checksum-sha256': checksum,
          },
          body: selectedFile,
        })

        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }

        finalImageUrl = publicUrl
        setIsUploading(false)
      }
      // If no changes to image, keep existing
      else {
        finalImageUrl = data?.user.image ?? undefined
      }

      // 4. Update profile
      await action.execute({
        name: values.name,
        imageUrl: finalImageUrl,
      })
    } catch {
      setIsUploading(false)
      toast.error('Failed to upload image')
      form.setError('imageUrl', {
        type: 'manual',
        message: 'Failed to upload image. Please try again.',
      })
    }
  }

  useEffect(() => {
    if (data?.user) {
      form.setValue('name', data.user.name)
      form.setValue('imageUrl', data.user.image ?? '')

      // Set initial preview to current user image
      if (!selectedFile && !isImageRemoved) {
        setImagePreview(data.user.image ?? '')
      }
    }
  }, [data?.user, form, selectedFile, isImageRemoved])

  // Determine what to show in avatar
  const currentImage =
    imagePreview || (!isImageRemoved && data?.user.image) || undefined
  const showRemoveButton = !!(currentImage || selectedFile)
  const isDisabled = isPending || action.isExecuting || isUploading

  return (
    <form
      className="max-w-md space-y-6"
      onSubmit={form.handleSubmit(handleFormSubmit)}
    >
      <FieldGroup className="gap-4">
        <Controller
          name="imageUrl"
          control={form.control}
          render={({ fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <UserAvatar
                    name={data?.user.name || ''}
                    image={currentImage || null}
                    className="size-20"
                  />
                  {showRemoveButton && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="-top-1 -right-1 absolute size-5 rounded-full p-0 shadow-sm"
                      onClick={handleRemoveImage}
                      disabled={isDisabled}
                      aria-label="Remove image"
                    >
                      <XIcon className="size-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept={IMAGE_CONFIG.ACCEPTED_TYPES.join(',')}
                    aria-invalid={fieldState.invalid}
                    onChange={handleImageChange}
                    disabled={isDisabled}
                  />
                  {!fieldState.invalid ? (
                    <FieldDescription className="text-xs">
                      .jpg .jpeg .png .webp formats are supported
                    </FieldDescription>
                  ) : (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              </div>
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                {...field}
                required
                id="name"
                type="text"
                aria-invalid={fieldState.invalid}
                disabled={isDisabled}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {form.formState.isDirty && (
        <ButtonLoading
          type="submit"
          loading={action.isExecuting || isUploading}
          disabled={isDisabled}
        >
          {isUploading ? 'Uploading...' : 'Save Changes'}
        </ButtonLoading>
      )}
    </form>
  )
}
