import type { ReactNode } from 'react'
import { FormControl, FormErrorMessage, FormField, FormLabel } from '@wanteddev/wds'

type FormItemProps = {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

function FormItem({ label, required, error, children }: FormItemProps) {
  return (
    <FormField>
      <FormLabel required={required} variant="label1" weight="medium">
        {label}
      </FormLabel>
      <FormControl>{children}</FormControl>
      {error && <FormErrorMessage color="semantic.status.negative">{error}</FormErrorMessage>}
    </FormField>
  )
}

export default FormItem
