'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { XIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
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
import { IMAGE_CONFIG } from '@/constants/image'
import { updateProfileAction } from '@/features/settings/profile/actions'
import { UpdateProfileSchema } from '@/features/settings/profile/types'
import { authClient } from '@/lib/auth-client'

export function ProfileDetailForm() {
  const { isPending, data, refetch } = authClient.useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateProfileAction,
    zodResolver(UpdateProfileSchema),
    {
      formProps: {
        defaultValues: {
          name: '',
          image: '',
        },
      },
      actionProps: {
        onSuccess: async () => {
          toast.success('Profile updated successfully')
          await refetch()
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

    if (!IMAGE_CONFIG.ACCEPTED_MIME.includes(file.type)) {
      form.setError('image', {
        type: 'pattern',
        message: 'Only .jpg, .jpeg, .png and .webp formats are supported',
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      form.setError('image', {
        type: 'max',
        message: 'Image must be less than 2MB',
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      form.setValue('image', base64, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    reader.onerror = () => {
      form.setError('image', {
        type: 'manual',
        message: 'Failed to read image file',
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    form.setValue('image', '', { shouldValidate: true, shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (data?.user) {
      form.setValue('name', data.user.name)
      form.setValue('image', data.user.image ?? '')
    }
  }, [data?.user, form])

  const imagePreview = form.watch('image')
  const isDisabled = isPending || action.isExecuting

  return (
    <form className="max-w-md space-y-6" onSubmit={handleSubmitWithAction}>
      <FieldGroup className="gap-4">
        <Controller
          name="image"
          control={form.control}
          render={({ fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="image">Avatar</FieldLabel>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <UserAvatar
                    name={data?.user.name ?? ''}
                    image={imagePreview}
                    className="size-20"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 size-5 rounded-full p-0 shadow-sm"
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
          loading={action.isExecuting}
          disabled={isDisabled}
        >
          Save Changes
        </ButtonLoading>
      )}
    </form>
  )
}
