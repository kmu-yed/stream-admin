import { useSearchParams } from 'react-router-dom'
import { Tab, TabList, TabListItem, TabPanel } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import RentalItemsPanel from './components/RentalItemsPanel'
import RentalRecordsPanel from './components/RentalRecordsPanel'
import RentalSettingsPanel from './components/RentalSettingsPanel'

function RentalsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'records'

  return (
    <>
      <PageHeader title="빌릴게 관리" description="대여 물품과 대여/반납 현황을 관리해요." />

      <Tab value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="records">대여/반납 현황</TabListItem>
          <TabListItem value="items">물품 관리</TabListItem>
          <TabListItem value="settings">설정 관리</TabListItem>
        </TabList>

        <TabPanel value="records">
          <RentalRecordsPanel />
        </TabPanel>
        <TabPanel value="items">
          <RentalItemsPanel />
        </TabPanel>
        <TabPanel value="settings">
          <RentalSettingsPanel />
        </TabPanel>
      </Tab>
    </>
  )
}

export default RentalsPage
