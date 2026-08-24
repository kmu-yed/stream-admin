export type NoticeCategory = '일반' | '제휴'

export type Notice = {
  id: string
  category: NoticeCategory
  title: string
  content: string
  thumbnailUrl?: string
  pinned: boolean
  createdAt: string
}

export type NoticeInput = Omit<Notice, 'id' | 'createdAt'>

export type FeedbackCategory = '학사' | '제휴' | '시설' | '행사' | '기타'

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
  category: FeedbackCategory
  answerText: string
}

export type FeedbackRound = {
  id: string
  roundNumber: number
  createdAt: string
  answers: FeedbackAnswer[]
}
