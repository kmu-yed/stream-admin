import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PaymentStatus, StudentCouncilFeeAccount, StudentMember } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const initialMembers: StudentMember[] = [
  { id: 'stu_1', name: '김학생', studentId: '20231234', department: '소프트웨어학부', paidAt: addDays(-20), status: '납부 완료', streamMembershipStatus: '가입' },
  { id: 'stu_2', name: '이대학', studentId: '20220512', department: '인공지능학부', status: '납부 확인 필요', streamMembershipStatus: '가입 전' },
  { id: 'stu_3', name: '박새내', studentId: '20241001', department: '소프트웨어학부', status: '납부 전', streamMembershipStatus: '가입' },
  { id: 'stu_4', name: '최학번', studentId: '20211122', department: '인공지능학부', status: '입금 확인 불가', managerMessage: '입금자 정보를 확인하지 못했어요. 문제가 있을 경우 학생회에 문의해 주세요.', streamMembershipStatus: '가입 전' },
  { id: 'stu_5', name: '정학생', studentId: '20230789', department: '소프트웨어학부', paidAt: addDays(-10), status: '납부 완료', streamMembershipStatus: '가입' },
]

const initialAccounts: StudentCouncilFeeAccount[] = [
  { id: 'account_2026', year: 2026, bank: '카카오뱅크', accountNumber: '3333-01-1234567', accountHolder: 'STREAM 학생회', feePerSemester: 20000 },
]

type StudentCouncilContextValue = {
  members: StudentMember[]
  accounts: StudentCouncilFeeAccount[]
  updatePaymentStatus: (id: string, status: PaymentStatus, managerMessage?: string) => void
  saveAccount: (account: Omit<StudentCouncilFeeAccount, 'id'>) => void
}

const StudentCouncilContext = createContext<StudentCouncilContextValue | null>(null)

export function StudentCouncilProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<StudentMember[]>(initialMembers)
  const [accounts, setAccounts] = useState<StudentCouncilFeeAccount[]>(initialAccounts)

  const value = useMemo<StudentCouncilContextValue>(
    () => ({
      members,
      accounts,
      updatePaymentStatus: (id, status, managerMessage) => {
        setMembers((prev) =>
          prev.map((member) =>
            member.id === id
              ? {
                  ...member,
                  status,
                  paidAt: status === '납부 완료' ? new Date().toISOString().slice(0, 10) : undefined,
                  managerMessage: status === '입금 확인 불가' ? managerMessage : undefined,
                }
              : member,
          ),
        )
      },
      saveAccount: (account) => {
        setAccounts((prev) => {
          const existing = prev.find((item) => item.year === account.year)
          return existing
            ? prev.map((item) => (item.id === existing.id ? { ...account, id: existing.id } : item))
            : [...prev, { ...account, id: `account_${account.year}` }].sort((a, b) => b.year - a.year)
        })
      },
    }),
    [accounts, members],
  )

  return <StudentCouncilContext.Provider value={value}>{children}</StudentCouncilContext.Provider>
}

export function useStudentCouncil() {
  const context = useContext(StudentCouncilContext)
  if (!context) throw new Error('useStudentCouncil must be used within StudentCouncilProvider')
  return context
}
