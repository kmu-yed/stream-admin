import type { ReactNode } from 'react'
import { FlexBox, Typography } from '@wanteddev/wds'

type FormInfoRowProps = {
  label: string
  error?: string
  children: ReactNode
}

function FormInfoRow({ label, error, children }: FormInfoRowProps) {
  return <FlexBox className="app-info-row" alignItems="flex-start" style={{ gap: 16 }}>
    <FlexBox alignItems="center" style={{ width: 88, minHeight: 48, flexShrink: 0 }}>
      <Typography variant="body1" weight="regular">{label}</Typography>
    </FlexBox>
    <FlexBox flexDirection="column" style={{ flex: 1, minWidth: 0, gap: 6 }}>
      {children}
      {error && <Typography variant="caption1" style={{ color: 'var(--semantic-status-negative)' }}>{error}</Typography>}
    </FlexBox>
  </FlexBox>
}

export default FormInfoRow
