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
  { id: 'q_1', content: '학생회관 자판기 고장 신고는 어디로 하나요?', studentName: '김학생', createdAt: addDays(-6), status: '공개답변완료' },
  { id: 'q_2', content: '중간고사 기간 도서관 연장 운영 계획이 있나요?', studentName: '이대학', createdAt: addDays(-5), status: '개별답변완료' },
  { id: 'q_3', content: '체육대회 참가 신청은 언제까지인가요?', studentName: '박새내', createdAt: addDays(-4), status: '답변작성중' },
  { id: 'q_4', content: '학생회비 미납 시 불이익이 있나요?', studentName: '최학번', createdAt: addDays(-2), status: '답변대기' },
  { id: 'q_5', content: '교내 카페 제휴 할인은 언제까지 적용되나요?', studentName: '정학생', createdAt: addDays(-1), status: '답변대기' },
  { id: 'q_6', content: '축제 부스 참여 신청 방법을 알고 싶어요.', studentName: '한학생', createdAt: addDays(-3), status: '개별답변완료' },
  { id: 'q_7', content: '학생회실 운영 시간은 어떻게 되나요?', studentName: '윤학생', createdAt: addDays(-7), status: '공개답변완료' },
]

const initialFeedbackRounds: FeedbackRound[] = [
  {
    id: 'fb_1',
    roundNumber: 1,
    createdAt: addDays(-5),
    status: '회차종료', openDate: addDays(-8), closeDate: addDays(-1),
    answers: [
      { questionId: 'q_1', answerText: '학생회관 1층 안내데스크로 신고해주시면 **당일 내 조치**됩니다.' },
      { questionId: 'q_2', answerText: '중간고사 기간 도서관은 **자정까지 연장 운영**됩니다.' },
    ],
  },
  {
    id: 'fb_2',
    roundNumber: 2,
    createdAt: addDays(-30),
    status: '회차종료', openDate: addDays(-28), closeDate: addDays(-21),
    answers: [
      { questionId: 'q_1', answerText: '시설 관련 문의는 안내데스크에서 접수하고 있어요.' },
      { questionId: 'q_2', answerText: '시험기간 연장 운영 일정은 공지로 안내드렸어요.' },
      { questionId: 'q_3', answerText: '체육대회 신청은 행사 페이지에서 진행돼요.' },
      { questionId: 'q_4', answerText: '학생회비 납부 여부에 따른 불이익은 없어요.' },
      { questionId: 'q_5', answerText: '제휴 할인 종료일은 공지사항을 확인해주세요.' },
      { questionId: 'q_6', answerText: '축제 부스 참여는 신청서를 제출하면 돼요.' },
      { questionId: 'q_7', answerText: '학생회실은 평일 오전 10시부터 오후 6시까지 운영해요.' },
    ],
  },
  {
    id: 'fb_3',
    roundNumber: 3,
    createdAt: addDays(-20),
    status: '회차종료', openDate: addDays(-18), closeDate: addDays(-12),
    answers: [
      { questionId: 'q_3', answerText: '참가 신청 기간은 행사별 안내를 확인해주세요.' },
      { questionId: 'q_4', answerText: '학생회비 사용 내역은 정기적으로 공개하고 있어요.' },
      { questionId: 'q_6', answerText: '부스 신청서 양식은 공지 게시판에서 내려받을 수 있어요.' },
      { questionId: 'q_7', answerText: '운영 시간 외 문의는 온라인으로 남겨주세요.' },
    ],
  },
  {
    id: 'fb_4',
    roundNumber: 4,
    createdAt: addDays(-10),
    status: '회차종료', openDate: addDays(-9), closeDate: addDays(-4),
    answers: [{ questionId: 'q_5', answerText: '제휴처별 혜택은 매월 공지로 갱신하고 있어요.' }],
  },
  {
    id: 'fb_5',
    roundNumber: 5,
    createdAt: addDays(-1),
    status: '질문접수중', openDate: addDays(-1), closeDate: addDays(7),
    answers: [],
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
  createFeedbackRound: (period: Pick<FeedbackRound, 'openDate' | 'closeDate'>) => void
  addFeedbackRound: (answers: FeedbackAnswer[]) => void
  updateFeedbackRound: (id: string, answers: FeedbackAnswer[]) => void
  deleteFeedbackRound: (id: string) => void
  updateFeedbackPeriod: (id: string, period: Pick<FeedbackPeriod, 'openDate' | 'closeDate'>) => void
  updateFeedbackQuestionStatus: (id: string, status: FeedbackQuestion['status']) => void
  updateFeedbackRoundStatus: (id: string, status: FeedbackRound['status']) => void
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
      createFeedbackRound: (period) => {
        const nextRoundNumber = feedbackRounds.reduce((max, round) => Math.max(max, round.roundNumber), 0) + 1
        const today = new Date().toISOString().slice(0, 10)
        setFeedbackRounds((prev) => [
          ...prev,
          {
            id: makeId('fb'),
            roundNumber: nextRoundNumber,
            createdAt: today,
            status: period.openDate <= today && today <= period.closeDate ? '질문접수중' : '오픈예정',
            openDate: period.openDate,
            closeDate: period.closeDate,
            answers: [],
          },
        ])
      },
      addFeedbackRound: (answers) => {
        const nextRoundNumber = feedbackRounds.reduce((max, round) => Math.max(max, round.roundNumber), 0) + 1
        setFeedbackRounds((prev) => [
          ...prev,
          { id: makeId('fb'), roundNumber: nextRoundNumber, createdAt: new Date().toISOString().slice(0, 10), status: '답변작성중', openDate: new Date().toISOString().slice(0, 10), closeDate: new Date().toISOString().slice(0, 10), answers },
        ])
        const answeredIds = new Set(answers.map((a) => a.questionId))
        setQuestions((prev) =>
          prev.map((question) => (answeredIds.has(question.id) ? { ...question, status: '개별답변완료' } : question)),
        )
      },
      updateFeedbackRound: (id, answers) => {
        setFeedbackRounds((prev) => prev.map((round) => (round.id === id ? { ...round, answers } : round)))
        const answeredIds = new Set(answers.map((a) => a.questionId))
        setQuestions((prev) =>
          prev.map((question) => (answeredIds.has(question.id) ? { ...question, status: '개별답변완료' } : question)),
        )
      },
      deleteFeedbackRound: (id) => {
        setFeedbackRounds((prev) => prev.filter((round) => round.id !== id))
      },
      updateFeedbackPeriod: (id, period) => {
        setFeedbackPeriods((prev) => prev.map((item) => (item.id === id ? { ...item, ...period } : item)))
      },
      updateFeedbackQuestionStatus: (id, status) => setQuestions((prev) => prev.map((question) => question.id === id ? { ...question, status } : question)),
      updateFeedbackRoundStatus: (id, status) => setFeedbackRounds((prev) => prev.map((round) => round.id === id ? { ...round, status } : round)),
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
