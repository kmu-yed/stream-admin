export type PaymentStatus = '납부 전' | '납부확인중' | '납부완료' | '확인필요'
export type StreamMembershipStatus = '가입' | '가입 전'

export const BANKS = ['경남', '광주', '기업', '국민', '대구', '부산', '산림', '새마을', 'SC제일', '신한', '신협', '수협', '케이뱅크', '우리', '우체국', '저축은행', '전북', '제주', '카카오뱅크', '토스뱅크', '하나', '농협'] as const

export type BankName = (typeof BANKS)[number]

export type StudentCouncilFeeAccount = {
  id: string
  year: number
  bank: BankName
  accountNumber: string
  accountHolder: string
  feePerSemester: number
}

export type StudentMember = {
  id: string
  name: string
  studentId: string
  department: string
  paidAt?: string
  managerMessage?: string
  status: PaymentStatus
  streamMembershipStatus: StreamMembershipStatus
}
