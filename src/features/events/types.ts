export type ApplicationFieldType = 'radio' | 'checkbox' | 'text'

export type ApplicationFormField = {
  id: string
  label: string
  required: boolean
  type: ApplicationFieldType
  options: string[]
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
  openDate: string
  deadline: string
  capacity: number | null
  infoLabels: EventInfoLabel[]
  description: string
  formFields: ApplicationFormField[]
  createdAt: string
}

export type EventFormInput = Omit<EventRecord, 'id' | 'createdAt'>

export type ApplicantStatus = '신청완료' | '취소'

export type Applicant = {
  id: string
  eventId: string
  name: string
  studentId: string
  appliedAt: string
  status: ApplicantStatus
  answers: Record<string, string>
}

export type EventStatus = '모집예정' | '모집중' | '모집종료'

export function getEventStatus(event: Pick<EventRecord, 'openDate' | 'deadline'>): EventStatus {
  const today = new Date().toISOString().slice(0, 10)
  if (today < event.openDate) return '모집예정'
  if (today > event.deadline) return '모집종료'
  return '모집중'
}
