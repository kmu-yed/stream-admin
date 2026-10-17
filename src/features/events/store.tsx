import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Applicant, AttendanceStatus, EventFormInput, EventRecord } from './types'

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
    images: [],
    openDate: addDays(-10),
    openTime: '09:00',
    deadline: addDays(5),
    deadlineTime: '18:00',
    eventStartDate: addDays(14),
    eventStartTime: '10:00',
    eventEndDate: addDays(15),
    eventEndTime: '18:00',
    venue: '대운동장 및 대강당',
    requiresFeePayment: true,
    isFirstCome: true,
    capacity: 200,
    description: '새내기들을 위한 오리엔테이션 행사입니다. 학과 소개, 레크리에이션, 친목 도모 프로그램이 진행됩니다.',
    formFields: [
      { id: 'fld_1', label: '새내기 배움터에 참석하시나요?', required: true, type: 'radio', options: ['참석', '불참'] },
      { id: 'fld_2', label: '알레르기 정보를 입력해 주세요.', required: false, type: 'text', options: [], maxLength: 200 },
      { id: 'fld_5', label: '따로 하고 싶은 질문이 있으시면 적어 주세요.', required: false, type: 'text', options: [], maxLength: 300 },
    ],
    createdAt: addDays(-20),
  },
  {
    id: 'evt_2',
    title: '체육대회',
    isPublic: true,
    images: [],
    openDate: addDays(3),
    openTime: '09:00',
    deadline: addDays(14),
    deadlineTime: '18:00',
    eventStartDate: addDays(21),
    eventStartTime: '10:00',
    eventEndDate: addDays(21),
    eventEndTime: '18:00',
    venue: '종합운동장',
    requiresFeePayment: false,
    isFirstCome: false,
    capacity: null,
    description: '학과 대항 체육대회입니다. 다양한 종목에 참여할 수 있습니다.',
    formFields: [
      {
        id: 'fld_3',
        label: '참여하고 싶은 종목을 모두 선택해 주세요.',
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
    images: [],
    openDate: addDays(-30),
    openTime: '09:00',
    deadline: addDays(-15),
    deadlineTime: '18:00',
    eventStartDate: addDays(-10),
    eventStartTime: '10:00',
    eventEndDate: addDays(-9),
    eventEndTime: '18:00',
    venue: '중앙광장',
    requiresFeePayment: false,
    isFirstCome: true,
    capacity: 40,
    description: '해오름제 부스 운영 동아리/학과를 모집합니다.',
    formFields: [
      { id: 'fld_4', label: '운영할 부스와 활동 내용을 자세히 소개해 주세요.', required: true, type: 'text', options: [], maxLength: 300 },
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
    answers: { fld_1: '참석', fld_2: '없습니다.', fld_5: '처음 참여하는 행사라 준비물이 궁금해요. 개인적으로 챙겨야 할 물품이 있을까요?' },
  },
  {
    id: 'app_2',
    eventId: 'evt_1',
    name: '이대학',
    studentId: '20265678',
    phone: '010-2345-6789',
    appliedAt: addDays(-7),
    status: '신청완료',
    answers: { fld_1: '참석', fld_2: '땅콩과 견과류에 알레르기가 있습니다. 음식에 견과류가 들어가거나 같은 조리도구를 사용한 경우에도 반응이 있어 주의가 필요합니다.', fld_5: '행사 당일 점심 식사가 제공되는지, 알레르기 때문에 별도 식사를 준비해 가도 되는지 알고 싶습니다.' },
  },
  {
    id: 'app_3',
    eventId: 'evt_1',
    name: '박신입',
    studentId: '20269999',
    phone: '010-3456-7890',
    appliedAt: addDays(-6),
    status: '취소',
    answers: { fld_1: '불참', fld_2: '없습니다.', fld_5: '행사에 참석하지 못할 경우 오리엔테이션 자료를 나중에 받을 수 있나요?' },
  },
  {
    id: 'app_4',
    eventId: 'evt_1',
    name: '최하린',
    studentId: '20263456',
    phone: '010-4567-8901',
    appliedAt: addDays(-5),
    status: '신청완료',
    answers: { fld_1: '참석', fld_2: '유제품을 섭취하면 두드러기가 생깁니다. 우유, 치즈, 버터가 포함된 음식은 피해야 합니다.', fld_5: '대중교통으로 이동할 예정인데 행사 장소까지 가는 셔틀버스가 운영되는지 궁금합니다. 운영된다면 탑승 장소와 시간을 알려주세요.' },
  },
  {
    id: 'app_5',
    eventId: 'evt_1',
    name: '정유나',
    studentId: '20264567',
    phone: '010-5678-9012',
    appliedAt: addDays(-4),
    status: '신청완료',
    answers: { fld_1: '참석', fld_2: '특별한 알레르기는 없습니다.', fld_5: '조별 활동은 현장에서 팀이 정해지는지, 친구와 같은 조로 참여할 수 있는지 궁금해요.' },
  },
  {
    id: 'app_6',
    eventId: 'evt_3',
    name: '한서윤',
    studentId: '20231290',
    phone: '010-6789-0123',
    appliedAt: addDays(-24),
    status: '신청완료',
    answers: { fld_4: '환경 동아리에서 재활용 소재로 키링을 만드는 체험 부스를 운영하고 싶습니다. 방문자가 직접 재료를 고르고 제작해 볼 수 있도록 준비할 예정입니다.' },
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
  updateAttendanceStatus: (applicantId: string, status: AttendanceStatus) => void
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
          isPublic: false,
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
      updateAttendanceStatus: (applicantId, status) => {
        setApplicants((prev) => prev.map((applicant) => applicant.id === applicantId ? { ...applicant, attendanceStatus: status } : applicant))
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
