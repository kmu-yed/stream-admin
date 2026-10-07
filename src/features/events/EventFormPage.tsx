import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Checkbox, DatePicker, FlexBox, TextArea, TextField, Typography, useToast, type DateType } from '@wanteddev/wds'
import { IconCircleInfo } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useEvents } from './store'
import type { EventFormInput } from './types'
import ApplicationFormBuilder from './components/ApplicationFormBuilder'

const emptyForm: EventFormInput = {
  title: '',
  openDate: '',
  deadline: '',
  eventStartDate: '',
  eventEndDate: '',
  venue: '',
  requiresFeePayment: false,
  isFirstCome: false,
  capacity: null,
  description: '',
  formFields: [],
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FlexBox
      flexDirection="column"
      style={{ gap: 12, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 20 }}
    >
      <Typography variant="body1" weight="bold">{title}</Typography>
      {children}
    </FlexBox>
  )
}

function EventFormItem(props: Omit<ComponentProps<typeof FormItem>, 'labelVariant' | 'labelWeight'>) {
  return <FormItem {...props} labelVariant="body1" labelWeight="regular" />
}

function EventInfoRow({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <FlexBox alignItems="flex-start" style={{ gap: 16 }}>
      <FlexBox alignItems="center" style={{ width: 88, minHeight: 48, flexShrink: 0 }}>
        {required && <Typography variant="body1" weight="bold" style={{ color: 'var(--semantic-status-negative)', marginRight: 3 }}>*</Typography>}
        <Typography variant="body1" weight="regular">{label}</Typography>
      </FlexBox>
      <FlexBox flexDirection="column" style={{ flex: 1, minWidth: 0, gap: 6 }}>
        {children}
        {error && <Typography variant="caption1" style={{ color: 'var(--semantic-status-negative)' }}>{error}</Typography>}
      </FlexBox>
    </FlexBox>
  )
}

function toDateValue(value: DateType) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function EventDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <DatePicker value={value ? new Date(`${value}T00:00:00`) : undefined} onChange={(nextValue) => onChange(toDateValue(nextValue))} format="YYYY-MM-DD" width="100%" />
}

function EventFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getEvent, createEvent, updateEvent } = useEvents()
  const toast = useToast()

  const existingEvent = id ? getEvent(id) : undefined
  const today = new Date().toISOString().slice(0, 10)
  const isRecruiting = Boolean(existingEvent && today >= existingEvent.openDate && today <= existingEvent.deadline)
  const isEnded = Boolean(existingEvent && today > existingEvent.deadline)
  const isApplicationLocked = isRecruiting || isEnded
  const [form, setForm] = useState<EventFormInput>(() =>
    existingEvent
      ? {
          title: existingEvent.title,
          openDate: existingEvent.openDate,
          deadline: existingEvent.deadline,
          eventStartDate: existingEvent.eventStartDate,
          eventEndDate: existingEvent.eventEndDate,
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

  const title = isEdit ? '행사 수정' : '새 행사 등록'

  const handleSubmit = () => {
    if (isEnded) return
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '행사 제목을 입력해주세요.'
    if (!form.openDate) nextErrors.openDate = '신청 오픈일을 선택해주세요.'
    if (!form.deadline) nextErrors.deadline = '신청 마감일을 선택해주세요.'
    if (form.openDate && form.deadline && form.openDate > form.deadline) {
      nextErrors.deadline = '신청 마감일은 신청 오픈일 이후여야 해요.'
    }
    if (!form.eventStartDate || !form.eventEndDate) nextErrors.eventDate = '행사 시작일과 종료일을 모두 선택해주세요.'
    else if (form.eventStartDate > form.eventEndDate) nextErrors.eventDate = '행사 종료일은 시작일 이후여야 해요.'
    if (!form.venue.trim()) nextErrors.venue = '행사 장소를 입력해주세요.'
    if (form.isFirstCome && (!form.capacity || form.capacity < 1)) nextErrors.capacity = '선착순 인원을 1명 이상 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateEvent(id, form)
      toast({ content: '행사 정보가 수정되었어요.', variant: 'positive' })
    } else {
      createEvent(form)
      toast({ content: '행사가 등록되었어요.', variant: 'positive' })
    }
    navigate('/events')
  }

  return (
    <>
      <PageHeader title={title} description="행사 정보와 신청 폼을 설정해요." />

      {isRecruiting && <FlexBox alignItems="flex-start" style={{ width: '100%', maxWidth: 640, gap: 8, padding: 14, marginBottom: 16, borderRadius: 10, color: 'var(--semantic-primary-normal)', background: 'rgba(0, 102, 255, 0.08)' }}><IconCircleInfo width={18} height={18} style={{ flexShrink: 0, marginTop: 2 }} /><Typography variant="body2" style={{ color: 'inherit' }}>신청이 진행 중이라 신청 기간, 대상·정원, 신청 폼은 변경할 수 없어요. 제목, 소개글, 행사 정보는 수정할 수 있어요.</Typography></FlexBox>}
      {isEnded && <FlexBox alignItems="flex-start" style={{ width: '100%', maxWidth: 640, gap: 8, padding: 14, marginBottom: 16, borderRadius: 10, color: 'var(--semantic-primary-normal)', background: 'rgba(0, 102, 255, 0.08)' }}><IconCircleInfo width={18} height={18} style={{ flexShrink: 0, marginTop: 2 }} /><Typography variant="body2" style={{ color: 'inherit' }}>모집이 종료된 행사는 읽기 전용이에요.</Typography></FlexBox>}

      <fieldset disabled={isEnded} style={{ margin: 0, padding: 0, border: 0 }}><FlexBox flexDirection="column" style={{ gap: 20, maxWidth: 640 }}>
        <FormSection title="기본 정보">
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
        </FormSection>

        <fieldset disabled={isApplicationLocked} style={{ margin: 0, padding: 0, border: 0 }}><FormSection title="신청 기간">
          <FlexBox style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 12, alignItems: 'end', width: '100%' }}>
            <FlexBox style={{ minWidth: 0 }}><EventFormItem label="신청 오픈일" required error={errors.openDate} style={{ width: '100%' }}><EventDatePicker value={form.openDate} onChange={(value) => setForm({ ...form, openDate: value })} /></EventFormItem></FlexBox>
            <FlexBox alignItems="center" justifyContent="center" style={{ height: 48 }}><Typography variant="body1" color="semantic.label.alternative">~</Typography></FlexBox>
            <FlexBox style={{ minWidth: 0 }}><EventFormItem label="신청 마감일" required error={errors.deadline} style={{ width: '100%' }}><EventDatePicker value={form.deadline} onChange={(value) => setForm({ ...form, deadline: value })} /></EventFormItem></FlexBox>
          </FlexBox>
        </FormSection></fieldset>

        <FormSection title="행사 정보">
          <FlexBox flexDirection="column" style={{ gap: 20 }}>
          <EventInfoRow label="일시" error={errors.eventDate}>
            <FlexBox style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 12, alignItems: 'end', width: '100%' }}>
              <FlexBox style={{ minWidth: 0 }}><FormItem label="시작일자" required labelVariant="label1" labelWeight="regular" style={{ width: '100%' }}><EventDatePicker value={form.eventStartDate} onChange={(value) => setForm({ ...form, eventStartDate: value })} /></FormItem></FlexBox>
              <FlexBox alignItems="center" justifyContent="center" style={{ height: 48 }}><Typography variant="body1" color="semantic.label.alternative">~</Typography></FlexBox>
              <FlexBox style={{ minWidth: 0 }}><FormItem label="종료일자" required labelVariant="label1" labelWeight="regular" style={{ width: '100%' }}><EventDatePicker value={form.eventEndDate} onChange={(value) => setForm({ ...form, eventEndDate: value })} /></FormItem></FlexBox>
            </FlexBox>
          </EventInfoRow>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <EventInfoRow label="장소" error={errors.venue}>
            <TextField value={form.venue} placeholder="행사 장소를 입력하세요" onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </EventInfoRow>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <fieldset disabled={isApplicationLocked} style={{ margin: 0, padding: 0, border: 0 }}><EventInfoRow label="대상" error={errors.capacity}>
            <FlexBox flexDirection="column" style={{ gap: 12 }}>
              <FlexBox alignItems="center" style={{ gap: 8 }}><Checkbox checked={form.requiresFeePayment} onCheckedChange={(checked) => setForm({ ...form, requiresFeePayment: checked })} /><Typography variant="body2">학생회비 납부자만 신청 가능</Typography></FlexBox>
              <FlexBox alignItems="center" style={{ gap: 8 }}><Checkbox checked={form.isFirstCome} onCheckedChange={(checked) => setForm({ ...form, isFirstCome: checked, capacity: checked ? form.capacity : null })} /><Typography variant="body2">선착순 신청</Typography></FlexBox>
              {form.isFirstCome && <FlexBox alignItems="center" style={{ gap: 8, paddingLeft: 28 }}><Typography variant="body2" color="semantic.label.alternative">선착순 인원</Typography><TextField type="number" placeholder="인원 입력" value={form.capacity === null ? '' : String(form.capacity)} onChange={(e) => setForm({ ...form, capacity: e.target.value === '' ? null : Number(e.target.value) })} style={{ width: 160 }} /><Typography variant="body2" color="semantic.label.alternative">명</Typography></FlexBox>}
            </FlexBox>
          </EventInfoRow></fieldset>
          </FlexBox>
        </FormSection>

        <fieldset disabled={isApplicationLocked} style={{ margin: 0, padding: 0, border: 0 }}><FormSection title="신청 폼">
          <FlexBox flexDirection="column" style={{ gap: 12 }}>
            <Typography variant="caption1" color="semantic.label.alternative">
              신청 시 사용자의 이름, 학번, 학생회비 납부 여부, 연락처는 자동으로 저장돼요.
            </Typography>
            <ApplicationFormBuilder value={form.formFields} onChange={(formFields) => setForm({ ...form, formFields })} />
          </FlexBox>
        </FormSection></fieldset>

        <FlexBox justifyContent="flex-end" style={{ gap: 8, marginTop: 4 }}>
          <Button variant="outlined" color="assistive" onClick={() => navigate('/events')}>
            취소
          </Button>
          <Button variant="solid" color="primary" disabled={isEnded} onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
        </FlexBox>
      </FlexBox></fieldset>
    </>
  )
}

export default EventFormPage
