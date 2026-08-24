import { useSearchParams } from 'react-router-dom'
import { Tab, TabList, TabListItem, TabPanel } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FaqPanel from './components/FaqPanel'
import ChatLogPanel from './components/ChatLogPanel'

function ChatbotPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'faq'

  return (
    <>
      <PageHeader title="챗봇 관리" description="FAQ와 사용자 문의 기록을 관리해요." />

      <Tab value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="faq">FAQ 설정</TabListItem>
          <TabListItem value="logs">문의 기록</TabListItem>
        </TabList>

        <TabPanel value="faq">
          <FaqPanel />
        </TabPanel>
        <TabPanel value="logs">
          <ChatLogPanel />
        </TabPanel>
      </Tab>
    </>
  )
}

export default ChatbotPage
