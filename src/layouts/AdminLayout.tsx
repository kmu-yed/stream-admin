import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FlexBox } from '@wanteddev/wds'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <FlexBox style={{ height: '100vh' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />
      <FlexBox flexDirection="column" style={{ flex: 1, minWidth: 0, height: '100vh' }}>
        <TopBar />
        <FlexBox
          as="main"
          flexDirection="column"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '0 80px 32px',
            background: 'var(--semantic-background-normal-normal)',
          }}
        >
          <Outlet />
        </FlexBox>
      </FlexBox>
    </FlexBox>
  )
}

export default AdminLayout
