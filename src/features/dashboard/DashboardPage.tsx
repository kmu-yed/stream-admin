import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlexBox, Typography } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import { useEvents } from '../events/store'
import { useRentals } from '../rentals/store'
import { useChatbot } from '../chatbot/store'
import { useBoards } from '../boards/store'
import { getRentalRecordStatus } from '../rentals/types'
import { getEventStatus } from '../events/types'

function diffDays(dateStr: string, baseStr: string) {
  return Math.round((new Date(dateStr).getTime() - new Date(baseStr).getTime()) / 86400000)
}

type StatTileProps = {
  label: string
  value: string
  helperLabel?: string
  helperTone?: BadgeTone
  onClick: () => void
}

function StatTile({ label, value, helperLabel, helperTone, onClick }: StatTileProps) {
  return (
    <FlexBox
      flexDirection="column"
      onClick={onClick}
      style={{
        flex: '0 1 260px',
        gap: 10,
        padding: 20,
        borderRadius: 12,
        border: '1px solid var(--semantic-line-normal-normal)',
        cursor: 'pointer',
      }}
    >
      <Typography variant="label1" color="semantic.label.alternative">
        {label}
      </Typography>
      <Typography variant="title1" weight="bold">
        {value}
      </Typography>
      {helperLabel && <StatusBadge label={helperLabel} tone={helperTone ?? 'neutral'} />}
    </FlexBox>
  )
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
  const { logs } = useChatbot()
  const { questions } = useBoards()

  const today = new Date().toISOString().slice(0, 10)

  const unresolvedLogs = logs.filter((log) => log.flag === '미해결')
  const oldestUnresolvedLog = [...unresolvedLogs].sort((a, b) => a.askedAt.localeCompare(b.askedAt))[0]
  const oldestUnresolvedDays = oldestUnresolvedLog ? diffDays(today, oldestUnresolvedLog.askedAt.slice(0, 10)) : 0

  const pendingQuestions = questions.filter((question) => question.status === '대기')

  const overdueRecords = records
    .filter((record) => getRentalRecordStatus(record) === '연체')
    .map((record) => ({ record, overdueDays: diffDays(today, record.dueDate) }))
    .sort((a, b) => b.overdueDays - a.overdueDays)

  const openEvents = events
    .filter((event) => getEventStatus(event) === '모집중')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))

  return (
    <>
      <PageHeader title="대시보드" description="학생회 서비스 운영 현황을 한눈에 확인해요." />

      <FlexBox style={{ gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatTile
          label="미해결 문의"
          value={`${unresolvedLogs.length}건`}
          helperLabel={oldestUnresolvedLog ? `가장 오래된 문의 D+${oldestUnresolvedDays}` : undefined}
          helperTone={oldestUnresolvedDays >= 2 ? 'negative' : 'cautionary'}
          onClick={() => navigate('/chatbot?tab=logs')}
        />
        <StatTile
          label="열린피드백 답변 대기"
          value={`${pendingQuestions.length}건`}
          helperLabel={pendingQuestions.length > 0 ? '확인 필요' : undefined}
          helperTone="cautionary"
          onClick={() => navigate('/feedback')}
        />
      </FlexBox>

      <FlexBox flexDirection="column" style={{ gap: 20 }}>
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
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => navigate(`/events/${event.id}/applicants`)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--semantic-line-normal-normal)',
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
