import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FeedbackAnswer, FeedbackAnswerDraft, FeedbackPeriod, FeedbackQuestion, FeedbackRound, Notice, NoticeInput } from './types'
import { getLocalDateValue } from './feedbackRoundStatus'

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
  {
    id: 'ntc_4',
    category: '일반',
    title: '2026학년도 2학기 학생회비 납부 기간과 방법, 자주 묻는 질문 및 유의사항 안내',
    content: '학생회비 납부 기간과 방법, 자주 묻는 질문을 안내드립니다.',
    images: [],
    pinned: false,
    createdAt: addDays(-2),
  },
]

const initialQuestions: FeedbackQuestion[] = [
  { id: 'q_1', content: '학생회관 자판기 고장 신고는 어디로 하나요?', studentName: '김학생', createdAt: addDays(-6), status: '공개답변완료' },
  { id: 'q_2', content: '중간고사 기간 도서관 연장 운영 계획이 있나요?', studentName: '이대학', createdAt: addDays(-5), status: '공개답변완료' },
  { id: 'q_3', content: '체육대회 참가 신청은 언제까지인가요?', studentName: '박새내', createdAt: addDays(-4), status: '답변작성중' },
  { id: 'q_4', content: '학생회비 미납 시 불이익이 있나요?', studentName: '최학번', createdAt: addDays(-2), status: '답변대기' },
  { id: 'q_5', content: '교내 카페 제휴 할인은 언제까지 적용되나요?', studentName: '정학생', createdAt: addDays(-1), status: '답변대기' },
  { id: 'q_6', content: '축제 부스 참여 신청 방법을 알고 싶어요.', studentName: '한학생', createdAt: addDays(-3), status: '공개답변완료' },
  { id: 'q_7', content: '학생회실 운영 시간은 어떻게 되나요?', studentName: '윤학생', createdAt: addDays(-7), status: '공개답변완료' },
  { id: 'q_8', content: '이번 학기 중간고사 기간에 도서관 열람실 좌석이 부족해서 학생회관의 빈 강의실이나 스터디 공간을 임시로 개방할 계획이 있는지 궁금합니다. 개방한다면 이용 가능한 날짜와 시간, 사전 예약이 필요한지, 야간에도 이용할 수 있는지, 그리고 시험 기간이 끝난 뒤에도 운영을 계속할 예정인지 함께 안내해 주실 수 있을까요?', studentName: '서민지', createdAt: addDays(0), status: '답변대기' },
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

const FEEDBACK_ROUNDS_KEY = 'stream-feedback-rounds'
const ANSWER_DRAFTS_KEY = 'stream-feedback-answer-drafts'

function readFeedbackRounds(): FeedbackRound[] {
  if (typeof window === 'undefined') return initialFeedbackRounds
  try {
    const stored = JSON.parse(window.localStorage.getItem(FEEDBACK_ROUNDS_KEY) ?? 'null') as unknown
    if (Array.isArray(stored) && stored.every((round) =>
      typeof round === 'object' && round !== null && typeof round.id === 'string'
      && typeof round.roundNumber === 'number' && typeof round.openDate === 'string'
      && typeof round.closeDate === 'string' && Array.isArray(round.answers))) {
      return stored as FeedbackRound[]
    }
  } catch { /* 손상된 회차 데이터는 기본 목록으로 복구한다. */ }
  return initialFeedbackRounds
}

function readAnswerDrafts(): FeedbackAnswerDraft[] {
  if (typeof window === 'undefined') return []
  let drafts: FeedbackAnswerDraft[] = []
  try {
    const stored = JSON.parse(window.localStorage.getItem(ANSWER_DRAFTS_KEY) ?? '[]') as unknown
    if (Array.isArray(stored)) {
      drafts = stored.filter((draft): draft is FeedbackAnswerDraft =>
        typeof draft === 'object' && draft !== null && typeof draft.id === 'string'
        && typeof draft.roundId === 'string' && Array.isArray(draft.answers)
        && draft.answers.every((answer: unknown) => typeof answer === 'object' && answer !== null
          && typeof (answer as FeedbackAnswer).questionId === 'string'
          && typeof (answer as FeedbackAnswer).answerText === 'string'))
    }
  } catch { /* 손상된 임시저장 데이터는 무시한다. */ }

  // 이전 버전에서 URL별로 저장한 답변도 목록에서 다시 열 수 있게 한다.
  const latestOpenRound = [...initialFeedbackRounds].reverse().find((round) => round.status !== '회차종료')
  const legacyEntries = [
    ...(latestOpenRound ? [{ key: 'stream-feedback-answer-draft-new', roundId: latestOpenRound.id }] : []),
    ...initialFeedbackRounds.map((round) => ({ key: `stream-feedback-answer-draft-${round.id}`, roundId: round.id })),
  ]
  for (const { key, roundId } of legacyEntries) {
    if (drafts.some((draft) => draft.id === `legacy-${key}`)) continue
    try {
      const stored = window.localStorage.getItem(key)
      if (!stored) continue
      const answers = Object.entries(JSON.parse(stored) as Record<string, { answerText?: string }>).map(([questionId, answer]) => ({ questionId, answerText: answer?.answerText ?? '' }))
      if (answers.length > 0) drafts.push({ id: `legacy-${key}`, roundId, answers })
    } catch { /* 손상된 이전 임시저장 데이터는 무시한다. */ }
  }
  return drafts
}

type BoardsContextValue = {
  notices: Notice[]
  questions: FeedbackQuestion[]
  feedbackRounds: FeedbackRound[]
  answerDrafts: FeedbackAnswerDraft[]
  feedbackPeriods: FeedbackPeriod[]
  addNotice: (input: NoticeInput) => Notice
  updateNotice: (id: string, input: NoticeInput) => void
  deleteNotice: (id: string) => void
  createFeedbackRound: (period: Pick<FeedbackRound, 'openDate' | 'closeDate'>) => void
  publishFeedbackRoundAnswers: (id: string, answers: FeedbackAnswer[]) => void
  updateFeedbackRound: (id: string, answers: FeedbackAnswer[]) => void
  saveFeedbackAnswerDraft: (roundId: string, answers: FeedbackAnswer[]) => void
  deleteFeedbackRound: (id: string) => void
  updateFeedbackPeriod: (id: string, period: Pick<FeedbackPeriod, 'openDate' | 'closeDate'>) => void
  updateFeedbackQuestionStatus: (id: string, status: FeedbackQuestion['status']) => void
  updateFeedbackRoundStatus: (id: string, status: FeedbackRound['status']) => void
}

const BoardsContext = createContext<BoardsContextValue | null>(null)

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [questions, setQuestions] = useState<FeedbackQuestion[]>(initialQuestions)
  const [feedbackRounds, setFeedbackRounds] = useState<FeedbackRound[]>(readFeedbackRounds)
  const [answerDrafts, setAnswerDrafts] = useState<FeedbackAnswerDraft[]>(readAnswerDrafts)
  const [feedbackPeriods, setFeedbackPeriods] = useState<FeedbackPeriod[]>(initialFeedbackPeriods)

  useEffect(() => {
    window.localStorage.setItem(ANSWER_DRAFTS_KEY, JSON.stringify(answerDrafts))
  }, [answerDrafts])

  useEffect(() => {
    window.localStorage.setItem(FEEDBACK_ROUNDS_KEY, JSON.stringify(feedbackRounds))
  }, [feedbackRounds])

  const value = useMemo<BoardsContextValue>(
    () => ({
      notices,
      questions,
      feedbackRounds,
      answerDrafts,
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
        const today = getLocalDateValue()
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
      publishFeedbackRoundAnswers: (id, answers) => {
        setFeedbackRounds((prev) => prev.map((round) => round.id === id ? { ...round, answers, status: '회차종료' } : round))
        setAnswerDrafts((prev) => prev.filter((draft) => draft.roundId !== id))
        window.localStorage.removeItem(`stream-feedback-answer-draft-${id}`)
        window.localStorage.removeItem('stream-feedback-answer-draft-new')
        const answeredIds = new Set(answers.map((a) => a.questionId))
        setQuestions((prev) =>
          prev.map((question) => (answeredIds.has(question.id) ? { ...question, status: '공개답변완료' } : question)),
        )
      },
      updateFeedbackRound: (id, answers) => {
        setFeedbackRounds((prev) => prev.map((round) => (round.id === id ? { ...round, answers, status: '회차종료' } : round)))
        setAnswerDrafts((prev) => prev.filter((draft) => draft.roundId !== id))
        window.localStorage.removeItem(`stream-feedback-answer-draft-${id}`)
        const answeredIds = new Set(answers.map((a) => a.questionId))
        setQuestions((prev) =>
          prev.map((question) => (answeredIds.has(question.id) ? { ...question, status: '공개답변완료' } : question)),
        )
      },
      deleteFeedbackRound: (id) => {
        setFeedbackRounds((prev) => prev.filter((round) => round.id !== id))
      },
      saveFeedbackAnswerDraft: (roundId, answers) => {
        setAnswerDrafts((prev) => [{ id: makeId('draft'), roundId, savedAt: new Date().toISOString(), answers }, ...prev].slice(0, 20))
      },
      updateFeedbackPeriod: (id, period) => {
        setFeedbackPeriods((prev) => prev.map((item) => (item.id === id ? { ...item, ...period } : item)))
      },
      updateFeedbackQuestionStatus: (id, status) => setQuestions((prev) => prev.map((question) => question.id === id ? { ...question, status } : question)),
      updateFeedbackRoundStatus: (id, status) => setFeedbackRounds((prev) => prev.map((round) => round.id === id ? { ...round, status } : round)),
    }),
    [notices, questions, feedbackRounds, answerDrafts, feedbackPeriods],
  )

  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>
}

export function useBoards() {
  const context = useContext(BoardsContext)
  if (!context) throw new Error('useBoards must be used within BoardsProvider')
  return context
}
