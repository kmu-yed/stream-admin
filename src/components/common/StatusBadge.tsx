import { Chip } from '@wanteddev/wds'

export type BadgeTone = 'neutral' | 'info' | 'positive' | 'negative' | 'cautionary'

type StatusBadgeProps = {
  label: string
  tone?: BadgeTone
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

function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const { background, color } = toneStyle[tone]
  return (
    <Chip
      size="small"
      disableInteraction
      style={{ background, color, border: 'none' }}
    >
      {label}
    </Chip>
  )
}

export default StatusBadge
