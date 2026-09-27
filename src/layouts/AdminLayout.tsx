import { useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FlexBox } from '@wanteddev/wds'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Breadcrumbs from './Breadcrumbs'

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileHeaderCompact, setMobileHeaderCompact] = useState(false)
  const lastScrollTop = useRef(0)

  const openMobileSidebar = () => {
    setSidebarCollapsed(false)
    setMobileSidebarOpen(true)
  }

  const handleMainScroll = (event: React.UIEvent<HTMLElement>) => {
    const currentScrollTop = event.currentTarget.scrollTop
    const difference = currentScrollTop - lastScrollTop.current

    if (currentScrollTop <= 8) setMobileHeaderCompact(false)
    else if (difference > 6) setMobileHeaderCompact(true)
    else if (difference < -6) setMobileHeaderCompact(false)

    lastScrollTop.current = currentScrollTop
  }

  return (
    <FlexBox className="admin-layout" style={{ height: '100vh' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      {mobileSidebarOpen && <button type="button" className="mobile-sidebar-backdrop" aria-label="메뉴 닫기" onClick={() => setMobileSidebarOpen(false)} />}
      <FlexBox className="admin-content" flexDirection="column" style={{ flex: 1, minWidth: 0, height: '100vh' }}>
        <TopBar onOpenMobileSidebar={openMobileSidebar} compact={mobileHeaderCompact} />
        <FlexBox
          as="main"
          className="admin-main"
          onScroll={handleMainScroll}
          flexDirection="column"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '0 80px 32px',
            background: 'var(--semantic-background-normal-normal)',
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </FlexBox>
      </FlexBox>
    </FlexBox>
  )
}

export default AdminLayout
