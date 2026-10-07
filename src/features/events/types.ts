export type ApplicationFieldType = 'radio' | 'checkbox' | 'text'

export type ApplicationFormField = {
  id: string
  label: string
  required: boolean
  type: ApplicationFieldType
  options: string[]
  allowOther?: boolean
  maxLength?: number
}

export type EventInfoLabel = {
  id: string
  label: string
  value: string
  locked?: boolean
}

export type EventRecord = {
  id: string
  title: string
  isPublic: boolean
  openDate: string
  deadline: string
  eventStartDate: string
  eventEndDate: string
  venue: string
  requiresFeePayment: boolean
  isFirstCome: boolean
  capacity: number | null
  description: string
  formFields: ApplicationFormField[]
  createdAt: string
}

export type EventFormInput = Omit<EventRecord, 'id' | 'createdAt' | 'isPublic'>

export type ApplicantStatus = '신청완료' | '취소'
export type AttendanceStatus = '미확정' | '참가완료' | '불참'

export type Applicant = {
  id: string
  eventId: string
  name: string
  studentId: string
  phone: string
  appliedAt: string
  status: ApplicantStatus
  attendanceStatus?: AttendanceStatus
  answers: Record<string, string>
}

export function getAttendanceStatus(applicant: Pick<Applicant, 'status' | 'attendanceStatus'>, event: Pick<EventRecord, 'eventEndDate'>): AttendanceStatus | '-' {
  if (applicant.status === '취소') return '-'
  if (applicant.attendanceStatus === '불참') return '불참'
  if (event.eventEndDate < new Date().toISOString().slice(0, 10)) return '참가완료'
  return applicant.attendanceStatus ?? '미확정'
}

export type EventStatus = '모집예정' | '모집중' | '모집종료'

export function getEventStatus(event: Pick<EventRecord, 'openDate' | 'deadline'>): EventStatus {
  const today = new Date().toISOString().slice(0, 10)
  if (today < event.openDate) return '모집예정'
  if (today > event.deadline) return '모집종료'
  return '모집중'
}
