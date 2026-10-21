import type { CSSProperties, ReactNode } from 'react'
import { Chip } from '@wanteddev/wds'

export type BadgeTone = 'neutral' | 'info' | 'positive' | 'negative' | 'cautionary'

type StatusBadgeProps = {
  label: string
  tone?: BadgeTone
  size?: 'xsmall' | 'small' | 'medium' | 'large'
  leadingContent?: ReactNode
  trailingContent?: ReactNode
  style?: CSSProperties
}

const toneStyle: Record<BadgeTone, { background: string; color: string }> = {
  neutral: {
    background: 'var(--semantic-fill-normal)',
    color: 'var(--semantic-label-alternative)',
  },
  info: {
    background: 'rgba(var(--semantic-primary-normal-rgb), 0.08)',
    color: 'var(--semantic-primary-normal)',
  },
  positive: {
    background: 'var(--semantic-background-status-positive)',
    color: 'var(--semantic-status-positive)',
  },
  negative: {
    background: 'var(--semantic-background-status-negative)',
    color: 'var(--semantic-status-negative)',
  },
  cautionary: {
    background: 'var(--semantic-background-status-cautionary)',
    color: 'var(--semantic-status-cautionary)',
  },
}

function StatusBadge({ label, tone = 'neutral', size = 'small', leadingContent, trailingContent, style }: StatusBadgeProps) {
  const { background, color } = toneStyle[tone]
  return (
    <Chip
      size={size}
      disableInteraction
      leadingContent={leadingContent}
      trailingContent={trailingContent}
      style={{ background, color, border: 'none', ...style }}
    >
      {label}
    </Chip>
  )
}

export default StatusBadge
