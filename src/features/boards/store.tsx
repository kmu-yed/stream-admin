import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FeedbackAnswer, FeedbackPeriod, FeedbackQuestion, FeedbackRound, Notice, NoticeInput } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialNotices: Notice[] = [
  {
    id: 'ntc_1',
    category: '일반',
    title: '2026년 2학기 학생회비 납부 안내',
    content: '2학기 학생회비 납부 기간 및 방법을 안내드립니다.',
    images: [],
    pinned: true,
    createdAt: addDays(-3),
  },
  {
    id: 'ntc_2',
    category: '제휴',
    title: '교내 카페 제휴 할인 이벤트',
    content: '학생증 제시 시 전 메뉴 10% 할인 혜택을 제공합니다.',
    images: [],
    pinned: false,
    createdAt: addDays(-1),
  },
  {
    id: 'ntc_3',
    category: '일반',
    title: '사물함 신청 일정 안내',
    content: '2026-2학기 사물함 신청이 시작되었습니다.',
    images: [],
    pinned: false,
    createdAt: addDays(-10),
  },
]

const initialQuestions: FeedbackQuestion[] = [
  { id: 'q_1', content: '학생회관 자판기 고장 신고는 어디로 하나요?', studentName: '김학생', createdAt: addDays(-6), status: '답변완료' },
  { id: 'q_2', content: '중간고사 기간 도서관 연장 운영 계획이 있나요?', studentName: '이대학', createdAt: addDays(-5), status: '답변완료' },
  { id: 'q_3', content: '체육대회 참가 신청은 언제까지인가요?', studentName: '박새내', createdAt: addDays(-4), status: '대기' },
  { id: 'q_4', content: '학생회비 미납 시 불이익이 있나요?', studentName: '최학번', createdAt: addDays(-2), status: '대기' },
  { id: 'q_5', content: '교내 카페 제휴 할인은 언제까지 적용되나요?', studentName: '정학생', createdAt: addDays(-1), status: '대기' },
]

const initialFeedbackRounds: FeedbackRound[] = [
  {
    id: 'fb_1',
    roundNumber: 1,
    createdAt: addDays(-5),
    answers: [
      { questionId: 'q_1', answerText: '학생회관 1층 안내데스크로 신고해주시면 **당일 내 조치**됩니다.' },
      { questionId: 'q_2', answerText: '중간고사 기간 도서관은 **자정까지 연장 운영**됩니다.' },
    ],
  },
]

const initialFeedbackPeriods: FeedbackPeriod[] = [
  { id: 'period_1', openDate: addDays(-72), closeDate: addDays(-58), createdAt: addDays(-80) },
  { id: 'period_2', openDate: addDays(-1), closeDate: addDays(13), createdAt: addDays(-7) },
  { id: 'period_3', openDate: addDays(48), closeDate: addDays(62), createdAt: addDays(-2) },
]

type BoardsContextValue = {
  notices: Notice[]
  questions: FeedbackQuestion[]
  feedbackRounds: FeedbackRound[]
  feedbackPeriods: FeedbackPeriod[]
  addNotice: (input: NoticeInput) => Notice
  updateNotice: (id: string, input: NoticeInput) => void
  deleteNotice: (id: string) => void
  addFeedbackRound: (answers: FeedbackAnswer[]) => void
  updateFeedbackRound: (id: string, answers: FeedbackAnswer[]) => void
  deleteFeedbackRound: (id: string) => void
  updateFeedbackPeriod: (id: string, period: Pick<FeedbackPeriod, 'openDate' | 'closeDate'>) => void
}

const BoardsContext = createContext<BoardsContextValue | null>(null)

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [questions, setQuestions] = useState<FeedbackQuestion[]>(initialQuestions)
  const [feedbackRounds, setFeedbackRounds] = useState<FeedbackRound[]>(initialFeedbackRounds)
  const [feedbackPeriods, setFeedbackPeriods] = useState<FeedbackPeriod[]>(initialFeedbackPeriods)

  const value = useMemo<BoardsContextValue>(
    () => ({
      notices,
      questions,
      feedbackRounds,
      feedbackPeriods,
      addNotice: (input) => {
        const notice: Notice = { ...input, id: makeId('ntc'), createdAt: new Date().toISOString().slice(0, 10) }
        setNotices((prev) => [notice, ...prev])
        return notice
      },
      updateNotice: (id, input) => {
        setNotices((prev) => prev.map((notice) => (notice.id === id ? { ...notice, ...input } : notice)))
      },
      deleteNotice: (id) => {
        setNotices((prev) => prev.filter((notice) => notice.id !== id))
      },
      addFeedbackRound: (answers) => {
        const nextRoundNumber = feedbackRounds.reduce((max, round) => Math.max(max, round.roundNumber), 0) + 1
        setFeedbackRounds((prev) => [
          ...prev,
          { id: makeId('fb'), roundNumber: nextRoundNumber, createdAt: new Date().toISOString().slice(0, 10), answers },
        ])
        const answeredIds = new Set(answers.map((a) => a.questionId))
        setQuestions((prev) =>
          prev.map((question) => (answeredIds.has(question.id) ? { ...question, status: '답변완료' } : question)),
        )
      },
      updateFeedbackRound: (id, answers) => {
        setFeedbackRounds((prev) => prev.map((round) => (round.id === id ? { ...round, answers } : round)))
        const answeredIds = new Set(answers.map((a) => a.questionId))
        setQuestions((prev) =>
          prev.map((question) => (answeredIds.has(question.id) ? { ...question, status: '답변완료' } : question)),
        )
      },
      deleteFeedbackRound: (id) => {
        setFeedbackRounds((prev) => prev.filter((round) => round.id !== id))
      },
      updateFeedbackPeriod: (id, period) => {
        setFeedbackPeriods((prev) => prev.map((item) => (item.id === id ? { ...item, ...period } : item)))
      },
    }),
    [notices, questions, feedbackRounds, feedbackPeriods],
  )

  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>
}

export function useBoards() {
  const context = useContext(BoardsContext)
  if (!context) throw new Error('useBoards must be used within BoardsProvider')
  return context
}
