import type { ReactNode } from 'react'
import { FlexBox, Typography } from '@wanteddev/wds'
import { IconCircleInfo } from '@wanteddev/wds-icon'

type InfoNoticeProps = {
  children: ReactNode
  maxWidth?: number | string
}

function InfoNotice({ children, maxWidth = 640 }: InfoNoticeProps) {
  return (
    <FlexBox
      alignItems="flex-start"
      style={{
        width: '100%',
        maxWidth,
        gap: 8,
        padding: 14,
        marginBottom: 16,
        borderRadius: 10,
        color: 'var(--semantic-primary-normal)',
        background: 'rgba(0, 102, 255, 0.08)',
      }}
    >
      <IconCircleInfo width={18} height={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <Typography variant="body2" style={{ color: 'inherit' }}>
        {children}
      </Typography>
    </FlexBox>
  )
}

export default InfoNotice
