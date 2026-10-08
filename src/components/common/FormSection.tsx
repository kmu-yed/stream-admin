import type { CSSProperties, ReactNode } from 'react'
import { FlexBox, Typography } from '@wanteddev/wds'

type FormSectionProps = {
  title?: string
  description?: string
  style?: CSSProperties
  children: ReactNode
}

function FormSection({ title, description, style, children }: FormSectionProps) {
  return (
    <FlexBox className="app-form-section" flexDirection="column" style={style}>
      {(title || description) && (
        <FlexBox flexDirection="column" style={{ gap: 4 }}>
          {title && <Typography variant="body1" weight="bold">{title}</Typography>}
          {description && <Typography variant="body2" color="semantic.label.alternative">{description}</Typography>}
        </FlexBox>
      )}
      {children}
    </FlexBox>
  )
}

export default FormSection
