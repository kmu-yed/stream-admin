import PageHeader from '../../components/common/PageHeader'
import FaqPanel from './components/FaqPanel'

function ChatbotPage() {
  return (
    <>
      <PageHeader title="챗봇 관리" description="챗봇에 노출할 질문과 답변을 관리해요." />
      <FaqPanel />
    </>
  )
}

export default ChatbotPage
