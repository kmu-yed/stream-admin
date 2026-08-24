export type PaymentStatus = '납부' | '미납'

export type StudentMember = {
  id: string
  name: string
  studentId: string
  department: string
  paidAt?: string
  status: PaymentStatus
}
