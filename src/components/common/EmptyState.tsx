import type { CSSProperties, ReactNode } from 'react'
import { FlexBox, Typography } from '@wanteddev/wds'

type EmptyStateProps = {
  message: string
  description?: string
  action?: ReactNode
  variant?: 'table' | 'panel' | 'compact'
  style?: CSSProperties
}

function EmptyState({ message, description, action, variant = 'panel', style }: EmptyStateProps) {
  return <FlexBox
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    style={{
      width: '100%',
      minHeight: variant === 'compact' ? 88 : variant === 'table' ? 120 : 180,
      gap: 8,
      padding: variant === 'compact' ? 12 : 24,
      border: variant === 'panel' ? '1px solid var(--semantic-line-normal-normal)' : undefined,
      borderRadius: variant === 'panel' ? 12 : undefined,
      textAlign: 'center',
      ...style,
    }}
  >
    <Typography variant="body2" color="semantic.label.alternative">{message}</Typography>
    {description && <Typography variant="caption1" color="semantic.label.assistive">{description}</Typography>}
    {action && <FlexBox justifyContent="center" style={{ marginTop: 8 }}>{action}</FlexBox>}
  </FlexBox>
}

export default EmptyState
