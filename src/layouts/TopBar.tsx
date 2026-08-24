import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, FlexBox, IconButton, Typography } from '@wanteddev/wds'
import { IconChevronLeft } from '@wanteddev/wds-icon'
import { navItems } from '../nav/navConfig'

function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isSubPage = !navItems.some((item) => item.path === location.pathname)

  return (
    <FlexBox
      as="header"
      alignItems="center"
      justifyContent="space-between"
      style={{
        flexShrink: 0,
        padding: '24px 80px',
      }}
    >
      <FlexBox alignItems="center">
        {isSubPage && (
          <IconButton variant="normal" size="small" onClick={() => navigate(-1)}>
            <IconChevronLeft width={20} height={20} />
          </IconButton>
        )}
      </FlexBox>

      {!isSubPage && (
        <FlexBox alignItems="center" style={{ gap: 10 }}>
          <FlexBox flexDirection="column" alignItems="flex-end">
            <Typography variant="label1" weight="medium">
              학생회 관리자
            </Typography>
            <Typography variant="caption1" color="semantic.label.alternative">
              admin@stream.ac.kr
            </Typography>
          </FlexBox>
          <Avatar variant="person" size="small" />
        </FlexBox>
      )}
    </FlexBox>
  )
}

export default TopBar
