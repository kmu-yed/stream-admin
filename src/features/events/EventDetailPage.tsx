import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import DetailInfoGrid from '../../components/common/DetailInfoGrid'
import FormSection from '../../components/common/FormSection'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import { useEvents } from './store'
import { getEventStatus, type EventStatus } from './types'

const statusTone: Record<EventStatus, BadgeTone> = {
  모집예정: 'cautionary',
  모집중: 'info',
  모집종료: 'neutral',
}

const fieldTypeLabel = { radio: '라디오', checkbox: '체크박스', text: '텍스트' }

function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEvent, getApplicants } = useEvents()
  const event = id ? getEvent(id) : undefined

  if (!event) {
    return <FormSection style={{ maxWidth: 800 }}>
      <Typography variant="body1" color="semantic.label.alternative">행사를 찾을 수 없어요.</Typography>
      <Button variant="outlined" color="assistive" onClick={() => navigate('/events')}>목록으로</Button>
    </FormSection>
  }

  const status = getEventStatus(event)
  const applicantCount = getApplicants(event.id).filter((applicant) => applicant.status === '신청완료').length
  const eventPeriod = event.eventStartDate === event.eventEndDate
    ? event.eventStartDate
    : `${event.eventStartDate} ~ ${event.eventEndDate}`

  return <FormSection style={{ maxWidth: 800 }}>
    <FlexBox alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
      <StatusBadge label={status} tone={statusTone[status]} />
      <StatusBadge label={event.isPublic ? '공개' : '비공개'} tone={event.isPublic ? 'positive' : 'neutral'} />
    </FlexBox>
    <Typography variant="title2" weight="bold" style={{ overflowWrap: 'anywhere' }}>{event.title}</Typography>
    <Typography variant="body2" color="semantic.label.alternative">등록일 {event.createdAt}</Typography>

    <div style={{ borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 24 }}>
      <DetailInfoGrid items={[
        { label: '행사 일시', value: eventPeriod },
        { label: '장소', value: event.venue || '-' },
        { label: '신청 기간', value: `${event.openDate} ~ ${event.deadline}` },
        { label: '신청 현황', value: `${applicantCount}명 / ${event.capacity ? `정원 ${event.capacity}명` : '인원 제한 없음'}` },
        { label: '모집 방식', value: event.isFirstCome ? '선착순' : '일반 모집' },
        { label: '신청 대상', value: event.requiresFeePayment ? '학생회비 납부자' : '전체 학생' },
      ]} />
    </div>

    <FlexBox flexDirection="column" style={{ gap: 8 }}>
      <Typography variant="body1" weight="bold">행사 소개</Typography>
      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.7 }}>{event.description || '-'}</Typography>
    </FlexBox>

    {event.formFields.length > 0 && <FlexBox flexDirection="column" style={{ gap: 12, borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 20 }}>
      <Typography variant="body1" weight="bold">신청 항목</Typography>
      {event.formFields.map((field) => <FlexBox key={field.id} flexDirection="column" style={{ gap: 2 }}>
        <Typography variant="body2" weight="medium">{field.label}{field.required ? ' · 필수' : ''}</Typography>
        <Typography variant="caption1" color="semantic.label.alternative">
          {fieldTypeLabel[field.type]}{field.options.length > 0 ? ` · ${field.options.join(', ')}` : ''}
        </Typography>
      </FlexBox>)}
    </FlexBox>}

    <FlexBox className="app-form-actions" justifyContent="flex-end" style={{ gap: 8 }}>
      <Button variant="outlined" color="assistive" onClick={() => navigate('/events')}>목록으로</Button>
      <Button variant="outlined" color="primary" onClick={() => navigate(`/events/${event.id}/applicants`)}>신청 현황</Button>
      <Button variant="solid" color="primary" onClick={() => navigate(`/events/${event.id}/edit`)}>수정</Button>
    </FlexBox>
  </FormSection>
}

export default EventDetailPage
