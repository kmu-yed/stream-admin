import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StudentMember } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const initialMembers: StudentMember[] = [
  { id: 'stu_1', name: '김학생', studentId: '20231234', department: '소프트웨어학부', paidAt: addDays(-20), status: '납부' },
  { id: 'stu_2', name: '이대학', studentId: '20220512', department: '인공지능학부', paidAt: addDays(-18), status: '납부' },
  { id: 'stu_3', name: '박새내', studentId: '20241001', department: '소프트웨어학부', status: '미납' },
  { id: 'stu_4', name: '최학번', studentId: '20211122', department: '인공지능학부', status: '미납' },
  { id: 'stu_5', name: '정학생', studentId: '20230789', department: '소프트웨어학부', paidAt: addDays(-10), status: '납부' },
]

type StudentCouncilContextValue = {
  members: StudentMember[]
  updatePaymentStatus: (id: string, status: StudentMember['status']) => void
}

const StudentCouncilContext = createContext<StudentCouncilContextValue | null>(null)

export function StudentCouncilProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<StudentMember[]>(initialMembers)

  const value = useMemo<StudentCouncilContextValue>(
    () => ({
      members,
      updatePaymentStatus: (id, status) => {
        setMembers((prev) =>
          prev.map((member) =>
            member.id === id
              ? { ...member, status, paidAt: status === '납부' ? new Date().toISOString().slice(0, 10) : undefined }
              : member,
          ),
        )
      },
    }),
    [members],
  )

  return <StudentCouncilContext.Provider value={value}>{children}</StudentCouncilContext.Provider>
}

export function useStudentCouncil() {
  const context = useContext(StudentCouncilContext)
  if (!context) throw new Error('useStudentCouncil must be used within StudentCouncilProvider')
  return context
}
