import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import { IconCalendarFill, IconCircleCheckFill, IconClockFill, IconMegaphoneFill, IconPersonsFill } from '@wanteddev/wds-icon'
import StatusBadge from '../../components/common/StatusBadge'
import { useEvents } from '../events/store'
import { useRentals } from '../rentals/store'
import { useStudentCouncil } from '../studentCouncil/store'
import { getRentalRecordStatus } from '../rentals/types'
import { getEventStatus } from '../events/types'

function diffDays(dateStr: string, baseStr: string) {
  return Math.round((new Date(dateStr).getTime() - new Date(baseStr).getTime()) / 86400000)
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FlexBox
      flexDirection="column"
      style={{
        gap: 12,
        padding: 20,
        borderRadius: 12,
        border: '1px solid var(--semantic-line-normal-normal)',
      }}
    >
      <Typography variant="label1" weight="bold">
        {title}
      </Typography>
      {children}
    </FlexBox>
  )
}

function ApplicationRateMeter({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <FlexBox alignItems="center" style={{ gap: 10, flex: 1 }}>
      <FlexBox
        style={{
          flex: 1,
          height: 8,
          borderRadius: 999,
          background: 'var(--semantic-fill-normal)',
          overflow: 'hidden',
        }}
      >
        <FlexBox style={{ width: `${clamped}%`, height: '100%', borderRadius: 999, background: 'var(--semantic-primary-normal)' }} />
      </FlexBox>
      <Typography variant="label2" weight="medium" style={{ minWidth: 36, textAlign: 'right' }}>
        {percent}%
      </Typography>
    </FlexBox>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const { events, getApplicants } = useEvents()
  const { records } = useRentals()
  const { members } = useStudentCouncil()
  const dashboardToday = new Date()
  const todayDayOfWeek = dashboardToday.getDay()
  const mondayOffset = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek
  const weekStart = new Date(dashboardToday.getFullYear(), dashboardToday.getMonth(), dashboardToday.getDate() + mondayOffset)
  const weekDates = Array.from({ length: 7 }, (_, index) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index))
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => toLocalDateKey(new Date()))

  const today = new Date().toISOString().slice(0, 10)

  const pendingPayments = members.filter((member) => member.status === '납부 확인 필요')
  const pendingRentalApprovals = records.filter((record) => ['대여 승인대기', '반납 승인대기'].includes(getRentalRecordStatus(record)))

  const overdueRecords = records
    .filter((record) => getRentalRecordStatus(record) === '대여중' && !record.returnedAt && today > record.dueDate.slice(0, 10))
    .map((record) => ({ record, overdueDays: diffDays(today, record.dueDate) }))
    .sort((a, b) => b.overdueDays - a.overdueDays)

  const openEvents = events
    .filter((event) => getEventStatus(event) === '모집중')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  const weeklySchedules: Record<string, string[]> = {
    '2026-09-24': ['행사 신청 마감'],
    '2026-09-26': ['2학기 운영 회의'],
  }

  return (
    <>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(360px, 1fr)', gap: 20, marginBottom: 20 }}>
        <FlexBox flexDirection="column" style={{ position: 'relative', minHeight: 310, padding: 28, borderRadius: 20, color: '#fff', background: 'linear-gradient(135deg, rgba(var(--semantic-primary-normal-rgb), .86), rgba(var(--semantic-primary-normal-rgb), .64))', border: '1px solid rgba(255,255,255,.34)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.36), 0 16px 36px rgba(var(--semantic-primary-normal-rgb),.16)', backdropFilter: 'blur(24px)', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', width: 240, height: 240, right: -76, top: -96, borderRadius: '50%', background: 'rgba(255,255,255,.22)', filter: 'blur(32px)' }} />
          <span style={{ position: 'absolute', width: 180, height: 180, left: '34%', bottom: -112, borderRadius: '50%', background: 'rgba(255,255,255,.12)', filter: 'blur(32px)' }} />
          <img src="/brand/stream-wordmark.png" alt="" aria-hidden="true" style={{ position: 'absolute', width: 360, height: 'auto', right: -104, top: 58, opacity: .19, filter: 'brightness(0) invert(1) blur(.35px)', transform: 'rotate(-7deg)', maskImage: 'linear-gradient(90deg, #000 0%, #000 48%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 48%, transparent 100%)', pointerEvents: 'none' }} />
          <img src="/brand/stream-wordmark.png" alt="" aria-hidden="true" style={{ position: 'absolute', width: 360, height: 'auto', right: -120, top: 58, opacity: .12, filter: 'brightness(0) invert(1) blur(8px)', transform: 'rotate(-7deg)', maskImage: 'linear-gradient(90deg, transparent 24%, #000 64%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 24%, #000 64%, transparent 100%)', pointerEvents: 'none' }} />
          <Typography variant="heading1" weight="bold" style={{ position: 'relative', marginTop: 12, color: '#fff' }}>김학생 님, 오늘의<br />학생회 운영을 살펴보세요.</Typography>
          <FlexBox style={{ gap: 12, marginTop: 'auto' }}>
            <FlexBox className="app-hoverable app-hoverable-on-dark" flexDirection="column" onClick={() => navigate('/student-council')} style={{ position: 'relative', flex: 1, cursor: 'pointer', padding: 18, borderRadius: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.26)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)', backdropFilter: 'blur(18px)' }}><IconPersonsFill width={22} height={22} style={{ marginBottom: 12, color: 'rgba(255,255,255,.88)' }} /><Typography variant="label2" style={{ color: 'rgba(255,255,255,.72)' }}>학생회비 납부 확인 필요</Typography><Typography variant="title1" weight="bold" style={{ color: '#fff' }}>{pendingPayments.length}건</Typography></FlexBox>
            <FlexBox className="app-hoverable app-hoverable-on-dark" flexDirection="column" onClick={() => navigate('/rentals?tab=records')} style={{ position: 'relative', flex: 1, cursor: 'pointer', padding: 18, borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)', backdropFilter: 'blur(18px)' }}><IconCircleCheckFill width={22} height={22} style={{ marginBottom: 12, color: 'rgba(255,255,255,.88)' }} /><Typography variant="label2" style={{ color: 'rgba(255,255,255,.72)' }}>대여/반납 승인 필요</Typography><Typography variant="title1" weight="bold" style={{ color: '#fff' }}>{pendingRentalApprovals.length}건</Typography></FlexBox>
          </FlexBox>
        </FlexBox>
        <FlexBox flexDirection="column" style={{ gap: 16, padding: 24, borderRadius: 16, background: 'var(--semantic-background-normal-normal)', border: '1px solid var(--semantic-line-normal-normal)' }}>
          <FlexBox justifyContent="space-between" alignItems="center"><Typography variant="label1" weight="bold">이번 주 일정</Typography><Typography variant="caption1" color="semantic.label.alternative">{weekStart.getMonth() + 1}월 {weekStart.getDate()}일 – {weekDates[6].getMonth() + 1}월 {weekDates[6].getDate()}일</Typography></FlexBox>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
              const date = weekDates[index]
              const dateKey = toLocalDateKey(date)
              const schedules = weeklySchedules[dateKey] ?? []
              const hasSchedule = schedules.length > 0
              const isToday = dateKey === toLocalDateKey(dashboardToday)
              const isSelected = selectedScheduleDate === dateKey
              return (
                <FlexBox
                  key={day}
                  className="app-hoverable app-hoverable-flat"
                  flexDirection="column"
                  alignItems="center"
                  onClick={() => setSelectedScheduleDate(dateKey)}
                  style={{
                    gap: 8,
                    padding: '12px 4px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--semantic-primary-normal)' : 'var(--semantic-fill-normal)',
                    border: isToday && !isSelected ? '1px solid var(--semantic-primary-normal)' : '1px solid transparent',
                    transition: 'background .16s ease, border-color .16s ease',
                  }}
                >
                  <Typography variant="caption1" style={{ color: isSelected ? '#fff' : undefined }}>{day}</Typography>
                  <Typography variant="body2" weight={isToday || isSelected ? 'bold' : 'medium'} style={{ color: isSelected ? '#fff' : isToday ? 'var(--semantic-primary-normal)' : undefined }}>{date.getDate()}</Typography>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: hasSchedule ? (isSelected ? '#fff' : 'var(--semantic-primary-normal)') : 'transparent' }} />
                </FlexBox>
              )
            })}
          </div>
          <FlexBox flexDirection="column" style={{ gap: 5, padding: '12px', borderRadius: 12, background: 'var(--semantic-fill-normal)' }}>
            <Typography variant="caption1" color="semantic.label.alternative">{Number(selectedScheduleDate.slice(5, 7))}월 {Number(selectedScheduleDate.slice(8, 10))}일 일정</Typography>
            {(weeklySchedules[selectedScheduleDate] ?? []).length > 0 ? (weeklySchedules[selectedScheduleDate] ?? []).map((schedule) => <Typography key={schedule} variant="body2" weight="medium">{schedule}</Typography>) : <Typography variant="body2" color="semantic.label.alternative">등록된 일정이 없어요.</Typography>}
          </FlexBox>
        </FlexBox>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(360px, 1fr)', gap: 20, marginBottom: 20 }}>
        <SectionCard title="빠른 메뉴">
          <FlexBox style={{ gap: 10 }}>
            <Button variant="solid" color="assistive" leadingContent={<IconCalendarFill width={18} height={18} />} style={{ flex: 1, padding: '13px 24px' }} onClick={() => navigate('/events/new')}>행사 등록</Button>
            <Button variant="solid" color="assistive" leadingContent={<IconMegaphoneFill width={18} height={18} />} style={{ flex: 1, padding: '13px 24px' }} onClick={() => navigate('/notices/new')}>공지 등록</Button>
            <Button variant="solid" color="assistive" leadingContent={<IconClockFill width={18} height={18} />} style={{ flex: 1, padding: '13px 24px' }} onClick={() => navigate('/display')}>일정 등록</Button>
          </FlexBox>
        </SectionCard>

        <SectionCard title="연체된 대여 물품">
          {overdueRecords.length === 0 ? (
            <Typography variant="body2" color="semantic.label.alternative">
              연체된 대여 물품이 없어요.
            </Typography>
          ) : (
            <FlexBox flexDirection="column" style={{ gap: 8 }}>
              {overdueRecords.map(({ record, overdueDays }) => (
                <FlexBox
                  key={record.id}
                  className="app-hoverable"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => navigate('/rentals')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--semantic-line-normal-normal)',
                    cursor: 'pointer',
                  }}
                >
                  <FlexBox alignItems="center" style={{ gap: 10 }}>
                    <StatusBadge label={`D+${overdueDays}`} tone="negative" />
                    <Typography variant="body1" weight="medium">
                      {record.itemName}
                    </Typography>
                    <Typography variant="caption1" color="semantic.label.alternative">
                      {record.borrowerName} ({record.borrowerStudentId})
                    </Typography>
                  </FlexBox>
                  <Typography variant="caption1" color="semantic.label.alternative">
                    반납예정일 {record.dueDate}
                  </Typography>
                </FlexBox>
              ))}
            </FlexBox>
          )}
        </SectionCard>
      </div>

      <FlexBox flexDirection="column" style={{ gap: 20 }}>
        <SectionCard title="행사 신청 현황">
          {openEvents.length === 0 ? (
            <Typography variant="body2" color="semantic.label.alternative">
              현재 모집 중인 행사가 없어요.
            </Typography>
          ) : (
            <FlexBox flexDirection="column" style={{ gap: 8 }}>
              {openEvents.map((event) => {
                const applicantCount = getApplicants(event.id).filter((a) => a.status === '신청완료').length
                const dDay = diffDays(event.deadline, today)
                const percent = event.capacity ? Math.round((applicantCount / event.capacity) * 100) : null

                return (
                  <FlexBox
                    key={event.id}
                    className="app-hoverable"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => navigate(`/events/${event.id}/applicants`)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'var(--semantic-fill-normal)',
                      cursor: 'pointer',
                      gap: 16,
                    }}
                  >
                    <FlexBox alignItems="center" style={{ gap: 10, flexShrink: 0 }}>
                      <StatusBadge label={dDay === 0 ? 'D-Day' : `D-${dDay}`} tone="info" />
                      <Typography variant="body1" weight="medium" style={{ whiteSpace: 'nowrap' }}>
                        {event.title}
                      </Typography>
                    </FlexBox>
                    {percent === null ? (
                      <Typography variant="caption1" color="semantic.label.alternative">
                        신청 {applicantCount}명 · 정원 제한 없음
                      </Typography>
                    ) : (
                      <FlexBox alignItems="center" style={{ gap: 12, flex: 1, maxWidth: 360 }}>
                        <ApplicationRateMeter percent={percent} />
                        <Typography
                          variant="caption1"
                          color="semantic.label.alternative"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {applicantCount} / {event.capacity}명
                        </Typography>
                      </FlexBox>
                    )}
                  </FlexBox>
                )
              })}
            </FlexBox>
          )}
        </SectionCard>
      </FlexBox>
    </>
  )
}

export default DashboardPage
