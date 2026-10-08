import type { CSSProperties, ReactNode } from 'react'
import { FormControl, FormErrorMessage, FormField, FormLabel } from '@wanteddev/wds'

type FormItemProps = {
  label: string
  required?: boolean
  error?: string
  labelVariant?: 'label1' | 'body1'
  labelWeight?: 'regular' | 'medium' | 'bold'
  style?: CSSProperties
  children: ReactNode
}

function FormItem({ label, required = false, error, labelVariant = 'label1', labelWeight = 'medium', style, children }: FormItemProps) {
  return (
    <FormField style={style}>
      <FormLabel variant={labelVariant} weight={labelWeight} required={required}>
        {label}
      </FormLabel>
      <FormControl>{children}</FormControl>
      {error && <FormErrorMessage color="semantic.status.negative">{error}</FormErrorMessage>}
    </FormField>
  )
}

export default FormItem
