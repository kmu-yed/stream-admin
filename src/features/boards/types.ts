export type NoticeCategory = '일반' | '제휴'

export type Notice = {
  id: string
  category: NoticeCategory
  title: string
  content: string
  images: string[]
  pinned: boolean
  createdAt: string
}

export type NoticeInput = Omit<Notice, 'id' | 'createdAt'>

export type FeedbackQuestionStatus = '답변완료' | '대기'

export type FeedbackQuestion = {
  id: string
  content: string
  studentName: string
  createdAt: string
  status: FeedbackQuestionStatus
}

export type FeedbackAnswer = {
  questionId: string
  answerText: string
}

export type FeedbackRound = {
  id: string
  roundNumber: number
  createdAt: string
  answers: FeedbackAnswer[]
}

export type FeedbackPeriod = {
  id: string
  openDate: string
  closeDate: string
  createdAt: string
}
