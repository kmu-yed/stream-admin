export type LockerStatus = 'available' | 'disabled'

export type LockerZone = 'A-1' | 'A-2' | 'A-3' | 'A-4' | 'B-1' | 'B-2' | 'C' | 'D'

export const LOCKER_ZONES: LockerZone[] = ['A-1', 'A-2', 'B-1', 'B-2', 'C', 'D', 'A-3', 'A-4']

export const LOCKER_ZONE_COUNTS: Record<LockerZone, number> = {
  'A-1': 36,
  'A-2': 9,
  'B-1': 60,
  'B-2': 40,
  C: 100,
  D: 20,
  'A-3': 18,
  'A-4': 27,
}

export const LOCKER_ZONE_RANGES: Record<LockerZone, { start: number; end: number }> = {
  'A-1': { start: 1, end: 36 },
  'A-2': { start: 82, end: 90 },
  'A-3': { start: 64, end: 81 },
  'A-4': { start: 37, end: 63 },
  'B-1': { start: 1, end: 60 },
  'B-2': { start: 61, end: 100 },
  C: { start: 1, end: 100 },
  D: { start: 1, end: 20 },
}

export type LockerLayoutGroup = {
  columns: number
  numbers: number[]
}

export const LOCKER_PHYSICAL_LAYOUTS: Record<LockerZone, LockerLayoutGroup[]> = {
  'A-1': [
    { columns: 3, numbers: [10, 11, 12, 13, 14, 15, 16, 17, 18] },
    { columns: 6, numbers: [25, 26, 27, 28, 29, 30, 22, 23, 24, 31, 32, 33, 19, 20, 21, 34, 35, 36] },
    { columns: 3, numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ],
  'A-2': [{ columns: 3, numbers: [82, 83, 84, 85, 86, 87, 88, 89, 90] }],
  'A-3': [{ columns: 6, numbers: [73, 74, 75, 64, 65, 66, 76, 77, 78, 67, 68, 69, 79, 80, 81, 70, 71, 72] }],
  'A-4': [{ columns: 9, numbers: [37, 38, 39, 46, 47, 48, 55, 56, 57, 40, 41, 42, 49, 50, 51, 58, 59, 60, 43, 44, 45, 52, 53, 54, 61, 62, 63] }],
  'B-1': [{ columns: 12, numbers: [1, 2, 11, 12, 21, 22, 31, 32, 41, 42, 51, 52, 3, 4, 13, 14, 23, 24, 33, 34, 43, 44, 53, 54, 5, 6, 15, 16, 25, 26, 35, 36, 45, 46, 55, 56, 7, 8, 17, 18, 27, 28, 37, 38, 47, 48, 57, 58, 9, 10, 19, 20, 29, 30, 39, 40, 49, 50, 59, 60] }],
  'B-2': [
    { columns: 2, numbers: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70] },
    { columns: 4, numbers: [71, 72, 81, 82, 73, 74, 83, 84, 75, 76, 85, 86, 77, 78, 87, 88, 79, 80, 89, 90] },
    { columns: 2, numbers: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100] },
  ],
  C: [{ columns: 20, numbers: [1, 2, 11, 12, 21, 22, 31, 32, 41, 42, 51, 52, 61, 62, 71, 72, 81, 82, 91, 92, 3, 4, 13, 14, 23, 24, 33, 34, 43, 44, 53, 54, 63, 64, 73, 74, 83, 84, 93, 94, 5, 6, 15, 16, 25, 26, 35, 36, 45, 46, 55, 56, 65, 66, 75, 76, 85, 86, 95, 96, 7, 8, 17, 18, 27, 28, 37, 38, 47, 48, 57, 58, 67, 68, 77, 78, 87, 88, 97, 98, 9, 10, 19, 20, 29, 30, 39, 40, 49, 50, 59, 60, 69, 70, 79, 80, 89, 90, 99, 100] }],
  D: [{ columns: 4, numbers: [1, 2, 11, 12, 3, 4, 13, 14, 5, 6, 15, 16, 7, 8, 17, 18, 9, 10, 19, 20] }],
}

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
