import { useSearchParams } from 'react-router-dom'
import { Tab, TabList, TabListItem, TabPanel } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import LockerLayoutPanel from './components/LockerLayoutPanel'
import LockerSchedulePanel from './components/LockerSchedulePanel'
import LockerApplicantsPanel from './components/LockerApplicantsPanel'
import LockerLayoutJsonPanel from './components/LockerLayoutJsonPanel'

function LockersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'layout'

  return (
    <>
      <PageHeader title="사물함 관리" description="사물함 구역, 신청 일정, 신청 현황을 관리해요." />

      <Tab value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="layout">구역 관리</TabListItem>
          <TabListItem value="schedule">신청 일정</TabListItem>
          <TabListItem value="applicants">신청 현황</TabListItem>
          <TabListItem value="layout-json">배치 데이터 설정</TabListItem>
        </TabList>

        <TabPanel value="layout" style={{ width: '100%', minWidth: 0 }}>
          <LockerLayoutPanel />
        </TabPanel>
        <TabPanel value="schedule" style={{ width: '100%', minWidth: 0 }}>
          <LockerSchedulePanel />
        </TabPanel>
        <TabPanel value="applicants" style={{ width: '100%', minWidth: 0 }}>
          <LockerApplicantsPanel />
        </TabPanel>
        <TabPanel value="layout-json" style={{ width: '100%', minWidth: 0 }}><LockerLayoutJsonPanel /></TabPanel>
      </Tab>
    </>
  )
}

export default LockersPage
