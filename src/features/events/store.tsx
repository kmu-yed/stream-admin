import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Applicant, EventFormInput, EventRecord } from './types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const initialEvents: EventRecord[] = [
  {
    id: 'evt_1',
    title: '2026학년도 새내기 배움터',
    isPublic: true,
    openDate: addDays(-10),
    deadline: addDays(5),
    eventStartDate: addDays(14),
    eventEndDate: addDays(15),
    venue: '대운동장 및 대강당',
    requiresFeePayment: true,
    isFirstCome: true,
    capacity: 200,
    description: '새내기들을 위한 오리엔테이션 행사입니다. 학과 소개, 레크리에이션, 친목 도모 프로그램이 진행됩니다.',
    formFields: [
      { id: 'fld_1', label: '참석 여부', required: true, type: 'radio', options: ['참석', '불참'] },
      { id: 'fld_2', label: '알레르기 유무', required: false, type: 'text', options: [], maxLength: 100 },
    ],
    createdAt: addDays(-20),
  },
  {
    id: 'evt_2',
    title: '체육대회',
    isPublic: true,
    openDate: addDays(3),
    deadline: addDays(14),
    eventStartDate: addDays(21),
    eventEndDate: addDays(21),
    venue: '종합운동장',
    requiresFeePayment: false,
    isFirstCome: false,
    capacity: null,
    description: '학과 대항 체육대회입니다. 다양한 종목에 참여할 수 있습니다.',
    formFields: [
      {
        id: 'fld_3',
        label: '참여 종목',
        required: true,
        type: 'checkbox',
        options: ['축구', '농구', '줄다리기', '이어달리기'],
      },
    ],
    createdAt: addDays(-3),
  },
  {
    id: 'evt_3',
    title: '해오름제 부스 신청',
    isPublic: true,
    openDate: addDays(-30),
    deadline: addDays(-15),
    eventStartDate: addDays(-10),
    eventEndDate: addDays(-9),
    venue: '중앙광장',
    requiresFeePayment: false,
    isFirstCome: true,
    capacity: 40,
    description: '해오름제 부스 운영 동아리/학과를 모집합니다.',
    formFields: [
      { id: 'fld_4', label: '부스 소개', required: true, type: 'text', options: [], maxLength: 300 },
    ],
    createdAt: addDays(-40),
  },
]

const initialApplicants: Applicant[] = [
  {
    id: 'app_1',
    eventId: 'evt_1',
    name: '김학생',
    studentId: '20261234',
    phone: '010-1234-5678',
    appliedAt: addDays(-8),
    status: '신청완료',
    answers: { fld_1: '참석', fld_2: '없음' },
  },
  {
    id: 'app_2',
    eventId: 'evt_1',
    name: '이대학',
    studentId: '20265678',
    phone: '010-2345-6789',
    appliedAt: addDays(-7),
    status: '신청완료',
    answers: { fld_1: '참석', fld_2: '땅콩' },
  },
  {
    id: 'app_3',
    eventId: 'evt_1',
    name: '박신입',
    studentId: '20269999',
    phone: '010-3456-7890',
    appliedAt: addDays(-6),
    status: '취소',
    answers: { fld_1: '불참', fld_2: '없음' },
  },
]

type EventsContextValue = {
  events: EventRecord[]
  applicants: Applicant[]
  getEvent: (id: string) => EventRecord | undefined
  getApplicants: (eventId: string) => Applicant[]
  createEvent: (input: EventFormInput) => EventRecord
  updateEvent: (id: string, input: EventFormInput) => void
  toggleEventVisibility: (id: string) => void
  setEventVisibility: (id: string, isPublic: boolean) => void
  deleteEvent: (id: string) => void
  cancelApplicant: (applicantId: string) => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventRecord[]>(initialEvents)
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants)

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      applicants,
      getEvent: (id) => events.find((event) => event.id === id),
      getApplicants: (eventId) => applicants.filter((applicant) => applicant.eventId === eventId),
      createEvent: (input) => {
        const event: EventRecord = {
          ...input,
          id: makeId('evt'),
          isPublic: true,
          createdAt: new Date().toISOString().slice(0, 10),
        }
        setEvents((prev) => [event, ...prev])
        return event
      },
      updateEvent: (id, input) => {
        setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, ...input } : event)))
      },
      toggleEventVisibility: (id) => {
        setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, isPublic: !event.isPublic } : event)))
      },
      setEventVisibility: (id, isPublic) => {
        setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, isPublic } : event)))
      },
      deleteEvent: (id) => {
        setEvents((prev) => prev.filter((event) => event.id !== id))
        setApplicants((prev) => prev.filter((applicant) => applicant.eventId !== id))
      },
      cancelApplicant: (applicantId) => {
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === applicantId ? { ...applicant, status: '취소' } : applicant,
          ),
        )
      },
    }),
    [events, applicants],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within EventsProvider')
  return context
}
