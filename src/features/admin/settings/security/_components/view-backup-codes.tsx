'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { viewBackupCodesAction } from '@/features/admin/settings/security/actions'
import { TwoFactorPasswordSchema } from '@/features/admin/settings/security/types'

type ViewBackupCodesProps = {
  onCodesViewed: (codes: string[]) => void
}

export function ViewBackupCodes({ onCodesViewed }: ViewBackupCodesProps) {
  const [open, setOpen] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      viewBackupCodesAction,
      zodResolver(TwoFactorPasswordSchema),
      {
        formProps: {
          defaultValues: { password: '' },
        },
        actionProps: {
          onSuccess: ({ data }) => {
            if (data?.backupCodes) {
              setBackupCodes(data.backupCodes)
              setOpen(false)
              toast.success('Backup codes retrieved')
              onCodesViewed(data.backupCodes)
            }
          },
        },
      }
    )

  const handleClose = () => {
    setOpen(false)
    resetFormAndAction()
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  return (
    <>
      {backupCodes.length > 0 ? (
        <Button size="sm" variant="default" onClick={downloadBackupCodes}>
          Download Codes
        </Button>
      ) : (
        <Button size="sm" type="button" onClick={() => setOpen(true)}>
          View Backup Codes
        </Button>
      )}

      {/* Modal */}
      <Modal
        open={open}
        onOpenChange={handleClose}
        size="sm"
        showClose={!action.isExecuting}
        dismissable={!action.isExecuting}
      >
        <form onSubmit={handleSubmitWithAction} className="space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-xl">View Backup Codes</h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Enter your password to view your backup codes
              </p>
            </div>
          </div>

          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="view-codes-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    autoFocus
                    required
                    aria-invalid={fieldState.invalid}
                    disabled={action.isExecuting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={action.isExecuting}
              className="flex-1"
            >
              Cancel
            </Button>
            <ButtonLoading
              type="submit"
              loading={action.isExecuting}
              disabled={action.isExecuting}
              className="flex-1"
            >
              View Codes
            </ButtonLoading>
          </Field>
        </form>
      </Modal>
    </>
  )
}
