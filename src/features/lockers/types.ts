export type LockerStatus = 'available' | 'disabled'

export type LockerZone = 'A-1' | 'A-2' | 'A-3' | 'A-4' | 'B-1' | 'B-2' | 'C' | 'D'

export const LOCKER_ZONES: LockerZone[] = ['A-1', 'A-2', 'A-3', 'A-4', 'B-1', 'B-2', 'C', 'D']

export type Locker = {
  id: string
  zone: LockerZone
  number: string
  status: LockerStatus
  assignedTo?: string
}

export type LockerDisplayStatus = '선택가능' | '선택불가' | '배정됨'

export function getLockerDisplayStatus(locker: Locker): LockerDisplayStatus {
  if (locker.assignedTo) return '배정됨'
  if (locker.status === 'disabled') return '선택불가'
  return '선택가능'
}

export type LockerApplicationStatus = '신청완료' | '취소'

export type LockerApplication = {
  id: string
  name: string
  studentId: string
  grade: number
  appliedAt: string
  status: LockerApplicationStatus
  lockerId?: string
}

export type SemesterTerm = 1 | 2

export type LockerSemester = {
  id: string
  year: number
  term: SemesterTerm
  applyStartDate: string
  applyEndDate: string
  useStartDate: string
  useEndDate: string
}

export function formatSemesterLabel(semester: Pick<LockerSemester, 'year' | 'term'>) {
  return `${semester.year}-${semester.term}학기`
}

export type SemesterStatus = '진행중' | '예정' | '종료'

export function getSemesterStatus(
  semester: Pick<LockerSemester, 'applyStartDate' | 'applyEndDate'>,
): SemesterStatus {
  const today = new Date().toISOString().slice(0, 10)
  if (today < semester.applyStartDate) return '예정'
  if (today > semester.applyEndDate) return '종료'
  return '진행중'
}
