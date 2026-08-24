export type FaqItem = {
  id: string
  question: string
  answer: string
  order: number
}

export type FaqInput = Omit<FaqItem, 'id' | 'order'>

export const MAX_FAQ_COUNT = 5

export type ChatLogFlag = '정상' | '미해결'

export type ChatLog = {
  id: string
  question: string
  studentName: string
  answer: string
  askedAt: string
  flag: ChatLogFlag
}
