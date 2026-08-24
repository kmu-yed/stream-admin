import type { ReactNode } from 'react'
import { FlexBox, Typography } from '@wanteddev/wds'

type PageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <FlexBox
      justifyContent="space-between"
      alignItems="flex-start"
      style={{ marginBottom: 24, gap: 16 }}
    >
      <FlexBox flexDirection="column" style={{ gap: 4 }}>
        <Typography variant="title2" weight="bold">
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="semantic.label.alternative">
            {description}
          </Typography>
        )}
      </FlexBox>
      {action}
    </FlexBox>
  )
}

export default PageHeader
