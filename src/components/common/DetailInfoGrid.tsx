import type { ReactNode } from 'react'
import { FlexBox, Typography } from '@wanteddev/wds'

type DetailInfoItem = {
  label: string
  value: ReactNode
}

function DetailInfoGrid({ items }: { items: DetailInfoItem[] }) {
  return (
    <div className="app-detail-info-grid">
      {items.map((item) => (
        <FlexBox key={item.label} flexDirection="column" style={{ gap: 4, minWidth: 0 }}>
          <Typography variant="caption1" color="semantic.label.alternative">{item.label}</Typography>
          <Typography variant="body2" style={{ overflowWrap: 'anywhere' }}>{item.value}</Typography>
        </FlexBox>
      ))}
    </div>
  )
}

export default DetailInfoGrid
