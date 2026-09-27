import { useState } from 'react'
import { Avatar, Button, FlexBox, IconButton, Menu, MenuContent, MenuTrigger, Typography } from '@wanteddev/wds'
import { IconLogout, IconMenu } from '@wanteddev/wds-icon'
import ConfirmModal from '../components/common/ConfirmModal'

function TopBar({ onOpenMobileSidebar, compact }: { onOpenMobileSidebar: () => void; compact: boolean }) {
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  return (
    <FlexBox
      as="header"
      className={`admin-topbar${compact ? ' mobile-header-compact' : ''}`}
      alignItems="center"
      justifyContent="space-between"
      style={{
        flexShrink: 0,
        padding: '24px 96px 24px 80px',
      }}
    >
      <FlexBox className="mobile-topbar-brand" alignItems="center" style={{ gap: 12 }}>
        <IconButton variant="normal" size="medium" aria-label="메뉴 열기" onClick={onOpenMobileSidebar}>
          <IconMenu width={24} height={24} />
        </IconButton>
        <FlexBox className="mobile-topbar-wordmark" alignItems="center" style={{ gap: 5 }}>
          <img src="/brand/favicon.png" alt="Stream" style={{ width: 21, height: 21, objectFit: 'contain' }} />
          <img src="/brand/stream-watermark.svg" alt="Stream" style={{ width: 75, height: 16.2, objectFit: 'contain' }} />
          <Typography variant="label2" weight="medium" color="semantic.label.alternative" style={{ transform: 'translateY(2px)' }}>관리자</Typography>
        </FlexBox>
      </FlexBox>
      <FlexBox className="desktop-topbar-account" style={{ marginLeft: 'auto' }}>
        <Menu open={logoutMenuOpen} onOpenChange={setLogoutMenuOpen}>
          <MenuTrigger>
            <FlexBox className="topbar-account-trigger app-hoverable" alignItems="center" style={{ gap: 10, borderRadius: 10, cursor: 'pointer' }}>
            <FlexBox className="topbar-account-copy" flexDirection="column" alignItems="flex-end">
              <Typography variant="label1" weight="medium">
                학생회 관리자
              </Typography>
              <Typography variant="caption1" color="semantic.label.alternative">
                admin@stream.ac.kr
              </Typography>
            </FlexBox>
            <Avatar variant="person" size="small" />
            </FlexBox>
          </MenuTrigger>
          <MenuContent position="bottom-end" offset={8} className="topbar-account-menu" style={{ zIndex: 200 }}>
            <FlexBox flexDirection="column">
              <FlexBox className="mobile-account-menu-profile" flexDirection="column">
                <Typography variant="label1" weight="medium">
                  학생회 관리자
                </Typography>
                <Typography variant="caption1" color="semantic.label.alternative">
                  admin@stream.ac.kr
                </Typography>
              </FlexBox>
              <FlexBox style={{ padding: 8 }}>
              <Button variant="outlined" color="assistive" leadingContent={<IconLogout width={18} height={18} />} style={{ width: '100%' }} onClick={() => { setLogoutMenuOpen(false); setLogoutConfirmOpen(true) }}>로그아웃</Button>
              </FlexBox>
            </FlexBox>
          </MenuContent>
        </Menu>
      </FlexBox>
      <ConfirmModal
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="로그아웃하시겠어요?"
        description="현재 관리자 계정에서 로그아웃해요."
        confirmLabel="로그아웃"
        tone="negative"
        onConfirm={() => undefined}
      />
    </FlexBox>
  )
}

export default TopBar
