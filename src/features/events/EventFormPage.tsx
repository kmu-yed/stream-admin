import { useState } from 'react'
import type { ComponentProps } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Checkbox, DatePicker, FlexBox, TextArea, TextField, Typography, useToast, type DateType } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import useFormDraft from '../../components/common/useFormDraft'
import FormItem from '../../components/common/FormItem'
import FormSection from '../../components/common/FormSection'
import InfoNotice from '../../components/common/InfoNotice'
import ImageUploadField from '../../components/common/ImageUploadField'
import NotFoundState from '../../components/common/NotFoundState'
import FormInfoRow from '../../components/common/FormInfoRow'
import { useEvents } from './store'
import { formatEventDateTime, type EventFormInput } from './types'
import ApplicationFormBuilder from './components/ApplicationFormBuilder'

const emptyForm: EventFormInput = {
  title: '',
  images: [],
  thumbnailUrl: undefined,
  openDate: '',
  openTime: '',
  deadline: '',
  deadlineTime: '',
  eventStartDate: '',
  eventStartTime: '',
  eventEndDate: '',
  eventEndTime: '',
  venue: '',
  requiresFeePayment: false,
  isFirstCome: false,
  capacity: null,
  description: '',
  formFields: [],
}

function EventFormItem(props: Omit<ComponentProps<typeof FormItem>, 'labelVariant' | 'labelWeight'>) {
  return <FormItem {...props} labelVariant="body1" labelWeight="regular" />
}

function toDateValue(value: DateType) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function EventDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <DatePicker value={value ? new Date(`${value}T00:00:00`) : undefined} onChange={(nextValue) => onChange(toDateValue(nextValue))} format="YYYY-MM-DD" width="100%" />
}

function EventDateTimeField({ date, time, timeLabel, onDateChange, onTimeChange }: { date: string; time: string; timeLabel: string; onDateChange: (value: string) => void; onTimeChange: (value: string) => void }) {
  return <FlexBox className="app-form-inline event-date-time-field" style={{ gap: 8, width: '100%', maxWidth: 328, minWidth: 0 }}>
    <FlexBox style={{ flex: '0 1 200px', minWidth: 0 }}><EventDatePicker value={date} onChange={onDateChange} /></FlexBox>
    <FlexBox style={{ width: 120, flexShrink: 0 }}><TextField width="100%" style={{ minWidth: 0 }} type="time" aria-label={timeLabel} value={time} onChange={(event) => onTimeChange(event.target.value)} /></FlexBox>
  </FlexBox>
}

function EventFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getEvent, getApplicants, createEvent, updateEvent } = useEvents()
  const toast = useToast()

  const existingEvent = id ? getEvent(id) : undefined
  const eventApplicants = id ? getApplicants(id) : []
  const hasApplicants = eventApplicants.length > 0
  const activeApplicantCount = eventApplicants.filter((applicant) => applicant.status === '신청완료').length
  const [form, setForm] = useState<EventFormInput>(() =>
    existingEvent
      ? {
          title: existingEvent.title,
          images: existingEvent.images,
          thumbnailUrl: existingEvent.thumbnailUrl,
          openDate: existingEvent.openDate,
          openTime: existingEvent.openTime,
          deadline: existingEvent.deadline,
          deadlineTime: existingEvent.deadlineTime,
          eventStartDate: existingEvent.eventStartDate,
          eventStartTime: existingEvent.eventStartTime,
          eventEndDate: existingEvent.eventEndDate,
          eventEndTime: existingEvent.eventEndTime,
          venue: existingEvent.venue,
          requiresFeePayment: existingEvent.requiresFeePayment,
          isFirstCome: existingEvent.isFirstCome,
          capacity: existingEvent.capacity,
          description: existingEvent.description,
          formFields: existingEvent.formFields,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { markSaved, draftControls, navigationGuard } = useFormDraft(`event:${id ?? 'new'}`, form, setForm)

  const title = isEdit ? '행사 수정' : '새 행사 등록'

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '행사 제목을 입력해주세요.'
    if (!form.openDate || !form.openTime) nextErrors.openDate = '신청 시작 날짜와 시각을 입력해주세요.'
    if (!form.deadline || !form.deadlineTime) nextErrors.deadline = '신청 마감 날짜와 시각을 입력해주세요.'
    if (form.openDate && form.openTime && form.deadline && form.deadlineTime && formatEventDateTime(form.openDate, form.openTime) >= formatEventDateTime(form.deadline, form.deadlineTime)) {
      nextErrors.deadline = '신청 마감은 시작 이후여야 해요.'
    }
    if (!form.eventStartDate || !form.eventStartTime || !form.eventEndDate || !form.eventEndTime) nextErrors.eventDate = '행사 시작·종료 날짜와 시각을 모두 입력해주세요.'
    else if (formatEventDateTime(form.eventStartDate, form.eventStartTime) >= formatEventDateTime(form.eventEndDate, form.eventEndTime)) nextErrors.eventDate = '행사 종료는 시작 이후여야 해요.'
    if (!form.venue.trim()) nextErrors.venue = '행사 장소를 입력해주세요.'
    if (form.isFirstCome && (!form.capacity || form.capacity < 1)) nextErrors.capacity = '선착순 인원을 1명 이상 입력해주세요.'
    if (form.capacity !== null && form.capacity < activeApplicantCount) nextErrors.capacity = `현재 신청완료 ${activeApplicantCount}명보다 정원을 적게 설정할 수 없어요.`
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateEvent(id, hasApplicants && existingEvent ? {
        title: existingEvent.title,
        images: existingEvent.images,
        thumbnailUrl: existingEvent.thumbnailUrl,
        openDate: form.openDate,
        openTime: form.openTime,
        deadline: form.deadline,
        deadlineTime: form.deadlineTime,
        eventStartDate: existingEvent.eventStartDate,
        eventStartTime: existingEvent.eventStartTime,
        eventEndDate: existingEvent.eventEndDate,
        eventEndTime: existingEvent.eventEndTime,
        venue: existingEvent.venue,
        requiresFeePayment: existingEvent.requiresFeePayment,
        isFirstCome: existingEvent.isFirstCome,
        capacity: form.capacity,
        description: existingEvent.description,
        formFields: existingEvent.formFields,
      } : form)
      toast({ content: '행사 정보가 수정되었어요.', variant: 'positive' })
    } else {
      createEvent(form)
      toast({ content: '행사가 등록되었어요.', variant: 'positive' })
    }
    markSaved()
    navigate('/events')
  }

  const updateImages = (images: string[]) => {
    setForm((current) => ({
      ...current,
      images,
      thumbnailUrl: images.includes(current.thumbnailUrl ?? '') ? current.thumbnailUrl : images[0],
    }))
  }

  if (isEdit && !existingEvent) return <NotFoundState entity="행사" onBack={() => navigate('/events')} />

  return (
    <>
      <PageHeader title={title} description="행사 정보와 신청 폼을 설정해요." />
      {navigationGuard}
      {draftControls}

      {!isEdit && <InfoNotice>등록하면 비공개로 저장돼요. 내용을 확인한 뒤 행사 목록에서 공개로 전환해 주세요.</InfoNotice>}
      {hasApplicants && <InfoNotice>신청자가 있어 신청 기간과 정원만 수정할 수 있어요. 그 외 행사 정보와 신청 폼은 변경할 수 없어요.</InfoNotice>}

      <FlexBox flexDirection="column" style={{ gap: 20, maxWidth: 760 }}>
        <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FormSection title="기본 정보">
          <EventFormItem label="행사 제목" required error={errors.title}>
            <TextField
              placeholder="예: 2026학년도 새내기 배움터"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </EventFormItem>
          <EventFormItem label="행사 소개글">
            <TextArea
              placeholder="행사에 대한 소개글을 입력하세요."
              value={form.description}
              width="100%"
              minRows={4}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </EventFormItem>
        </FormSection></fieldset>

        <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FormSection title="행사 이미지">
          <FormItem label="이미지 업로드">
            <ImageUploadField value={form.images} onChange={updateImages} multiple maxCount={6} previewSize={120} selectedIndex={form.images.indexOf(form.thumbnailUrl ?? '')} onSelect={(index) => setForm((current) => ({ ...current, thumbnailUrl: current.images[index] }))} />
          </FormItem>
          <Typography variant="caption1" color="semantic.label.alternative">사진 왼쪽 위의 원을 눌러 썸네일을 변경할 수 있어요.</Typography>
        </FormSection></fieldset>

        <FormSection title="신청 기간">
          <FlexBox className="app-date-range app-labeled-date-range event-application-range" style={{ display: 'grid', gap: 12, width: '100%' }}>
            <FlexBox style={{ minWidth: 0 }}><EventFormItem label="신청 시작" required error={errors.openDate} style={{ width: '100%' }}><EventDateTimeField date={form.openDate} time={form.openTime} timeLabel="신청 시작 시각" onDateChange={(value) => setForm({ ...form, openDate: value })} onTimeChange={(value) => setForm({ ...form, openTime: value })} /></EventFormItem></FlexBox>
            <FlexBox className="app-date-range-separator" alignItems="center" justifyContent="center" style={{ height: 48 }}><Typography variant="body1" color="semantic.label.alternative">~</Typography></FlexBox>
            <FlexBox style={{ minWidth: 0 }}><EventFormItem label="신청 마감" required error={errors.deadline} style={{ width: '100%' }}><EventDateTimeField date={form.deadline} time={form.deadlineTime} timeLabel="신청 마감 시각" onDateChange={(value) => setForm({ ...form, deadline: value })} onTimeChange={(value) => setForm({ ...form, deadlineTime: value })} /></EventFormItem></FlexBox>
          </FlexBox>
        </FormSection>

        <FormSection title="행사 정보">
          <FlexBox flexDirection="column" style={{ gap: 20 }}>
          <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FormInfoRow label="일시" error={errors.eventDate}>
            <FlexBox flexDirection="column" style={{ gap: 16, width: '100%', minWidth: 0 }}>
              <FormItem label="시작" required labelVariant="label1" labelWeight="regular" style={{ width: '100%' }}><EventDateTimeField date={form.eventStartDate} time={form.eventStartTime} timeLabel="행사 시작 시각" onDateChange={(value) => setForm({ ...form, eventStartDate: value })} onTimeChange={(value) => setForm({ ...form, eventStartTime: value })} /></FormItem>
              <FormItem label="종료" required labelVariant="label1" labelWeight="regular" style={{ width: '100%' }}><EventDateTimeField date={form.eventEndDate} time={form.eventEndTime} timeLabel="행사 종료 시각" onDateChange={(value) => setForm({ ...form, eventEndDate: value })} onTimeChange={(value) => setForm({ ...form, eventEndTime: value })} /></FormItem>
            </FlexBox>
          </FormInfoRow></fieldset>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FormInfoRow label="장소" error={errors.venue}>
            <TextField value={form.venue} placeholder="행사 장소를 입력하세요" onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </FormInfoRow></fieldset>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <FormInfoRow label="대상" error={errors.capacity}>
            <FlexBox flexDirection="column" style={{ gap: 12 }}>
              <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FlexBox alignItems="center" style={{ gap: 8 }}><Checkbox checked={form.requiresFeePayment} onCheckedChange={(checked) => setForm({ ...form, requiresFeePayment: checked })} /><Typography variant="body2">학생회비 납부자만 신청 가능</Typography></FlexBox></fieldset>
              <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FlexBox alignItems="center" style={{ gap: 8 }}><Checkbox checked={form.isFirstCome} onCheckedChange={(checked) => setForm({ ...form, isFirstCome: checked, capacity: checked ? form.capacity : null })} /><Typography variant="body2">선착순 신청</Typography></FlexBox></fieldset>
              {form.isFirstCome && <FlexBox alignItems="center" style={{ gap: 8, paddingLeft: 28 }}><Typography variant="body2" color="semantic.label.alternative">선착순 인원</Typography><TextField type="number" placeholder="인원 입력" value={form.capacity === null ? '' : String(form.capacity)} onChange={(e) => setForm({ ...form, capacity: e.target.value === '' ? null : Number(e.target.value) })} style={{ width: 160 }} /><Typography variant="body2" color="semantic.label.alternative">명</Typography></FlexBox>}
            </FlexBox>
          </FormInfoRow>
          </FlexBox>
        </FormSection>

        <fieldset disabled={hasApplicants} style={{ margin: 0, padding: 0, border: 0 }}><FormSection title="신청 폼">
          <FlexBox flexDirection="column" style={{ gap: 12 }}>
            <Typography variant="caption1" color="semantic.label.alternative">
              신청 시 사용자의 이름, 학번, 학생회비 납부 여부, 연락처는 자동으로 저장돼요.
            </Typography>
            <ApplicationFormBuilder value={form.formFields} onChange={(formFields) => setForm({ ...form, formFields })} />
          </FlexBox>
        </FormSection></fieldset>

        <FlexBox className="app-form-actions" justifyContent="flex-end" style={{ gap: 8, marginTop: 4 }}>
          <Button variant="outlined" color="assistive" onClick={() => navigate('/events')}>
            취소
          </Button>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default EventFormPage
