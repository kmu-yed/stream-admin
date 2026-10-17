import type { FeedbackAnswerDraft, FeedbackRound, FeedbackRoundStatus } from './types'

export function getLocalDateValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getFeedbackRoundStatus(round: FeedbackRound, drafts: FeedbackAnswerDraft[], today = getLocalDateValue()): FeedbackRoundStatus {
  if (round.status === '회차종료' || round.answers.length > 0) return '회차종료'
  if (drafts.some((draft) => draft.roundId === round.id)) return '답변작성중'
  if (today < round.openDate) return '오픈예정'
  if (today <= round.closeDate) return '질문접수중'
  return '답변작성중'
}
