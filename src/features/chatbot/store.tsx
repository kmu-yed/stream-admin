import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ChatLog, FaqInput, FaqItem } from './types'

function addHours(hours: number) {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialFaqs: FaqItem[] = [
  { id: 'faq_1', question: '사물함 신청은 언제 할 수 있나요?', answer: '학기 초 공지되는 신청 일정 기간 동안 신청할 수 있어요.', order: 1 },
  { id: 'faq_2', question: '학생회비는 어떻게 납부하나요?', answer: '학생회 메뉴 > 납부 안내를 참고해주세요.', order: 2 },
  { id: 'faq_3', question: '행사 신청을 취소하고 싶어요.', answer: '행사 상세 페이지의 신청 취소 버튼을 이용해주세요.', order: 3 },
]

const initialLogs: ChatLog[] = [
  { id: 'log_1', question: '사물함 배정 결과는 어디서 확인하나요?', studentName: '김학생', answer: '마이페이지 > 사물함 메뉴에서 확인할 수 있어요.', askedAt: addHours(2), flag: '정상' },
  { id: 'log_2', question: '체육대회 종목별 신청 인원 제한이 있나요?', studentName: '이대학', answer: '죄송해요, 아직 답변을 준비 중이에요.', askedAt: addHours(5), flag: '미해결' },
  { id: 'log_3', question: '학생회비 환불이 가능한가요?', studentName: '박새내', answer: '학생회비는 등록금과 함께 자동 납부되며 별도 환불 절차는 없어요.', askedAt: addHours(9), flag: '미해결' },
  { id: 'log_4', question: '해오름제 일정이 언제인가요?', studentName: '최학번', answer: '2026년 10월 중 진행 예정이며, 자세한 일정은 추후 공지됩니다.', askedAt: addHours(20), flag: '정상' },
]

type ChatbotContextValue = {
  faqs: FaqItem[]
  logs: ChatLog[]
  addFaq: (input: FaqInput) => void
  updateFaq: (id: string, input: FaqInput) => void
  deleteFaq: (id: string) => void
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs)
  const [logs] = useState<ChatLog[]>(initialLogs)

  const value = useMemo<ChatbotContextValue>(
    () => ({
      faqs,
      logs,
      addFaq: (input) => {
        const nextOrder = faqs.reduce((max, faq) => Math.max(max, faq.order), 0) + 1
        setFaqs((prev) => [...prev, { ...input, id: makeId('faq'), order: nextOrder }])
      },
      updateFaq: (id, input) => {
        setFaqs((prev) => prev.map((faq) => (faq.id === id ? { ...faq, ...input } : faq)))
      },
      deleteFaq: (id) => {
        setFaqs((prev) => prev.filter((faq) => faq.id !== id))
      },
    }),
    [faqs, logs],
  )

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (!context) throw new Error('useChatbot must be used within ChatbotProvider')
  return context
}
