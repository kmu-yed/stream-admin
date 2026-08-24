import { useState } from 'react'
import { Typography } from '@wanteddev/wds'

type RowActionButtonProps = {
  children: string
  danger?: boolean
  onClick: () => void
}

function RowActionButton({ children, danger, onClick }: RowActionButtonProps) {
  const [hover, setHover] = useState(false)

  const color = hover
    ? danger
      ? 'var(--semantic-status-negative)'
      : 'var(--semantic-label-normal)'
    : 'var(--semantic-label-alternative)'

  return (
    <Typography
      variant="label1"
      weight="medium"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ color, cursor: 'pointer', padding: '4px 0px' }}
    >
      {children}
    </Typography>
  )
}

export default RowActionButton
