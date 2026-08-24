import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, TextArea, TextField, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useEvents } from './store'
import type { EventFormInput } from './types'
import InfoLabelsEditor from './components/InfoLabelsEditor'
import ApplicationFormBuilder from './components/ApplicationFormBuilder'

function makeId() {
  return `lbl_${Math.random().toString(36).slice(2, 9)}`
}

const emptyForm: EventFormInput = {
  title: '',
  openDate: '',
  deadline: '',
  capacity: null,
  infoLabels: [
    { id: makeId(), label: '일시', value: '', locked: true },
    { id: makeId(), label: '장소', value: '', locked: true },
  ],
  description: '',
  formFields: [],
}

function EventFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getEvent, createEvent, updateEvent } = useEvents()
  const toast = useToast()

  const existingEvent = id ? getEvent(id) : undefined
  const [form, setForm] = useState<EventFormInput>(() =>
    existingEvent
      ? {
          title: existingEvent.title,
          openDate: existingEvent.openDate,
          deadline: existingEvent.deadline,
          capacity: existingEvent.capacity,
          infoLabels: existingEvent.infoLabels,
          description: existingEvent.description,
          formFields: existingEvent.formFields,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const title = isEdit ? '행사 수정' : '새 행사 등록'

  const infoLabelErrors = useMemo(() => {
    const missing = form.infoLabels.filter((label) => label.locked && !label.value.trim())
    return missing.map((label) => label.label)
  }, [form.infoLabels])

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '행사 제목을 입력해주세요.'
    if (!form.openDate) nextErrors.openDate = '신청 오픈일을 선택해주세요.'
    if (!form.deadline) nextErrors.deadline = '모집 마감일을 선택해주세요.'
    if (form.openDate && form.deadline && form.openDate > form.deadline) {
      nextErrors.deadline = '모집 마감일은 신청 오픈일 이후여야 해요.'
    }
    if (infoLabelErrors.length > 0) {
      nextErrors.infoLabels = `${infoLabelErrors.join(', ')} 항목을 입력해주세요.`
    }
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

      <FlexBox flexDirection="column" style={{ gap: 32, maxWidth: 720 }}>
        <FormItem label="행사 제목" required error={errors.title}>
          <TextField
            placeholder="예: 2026학년도 새내기 배움터"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormItem>

        <FlexBox style={{ gap: 16 }}>
          <FlexBox style={{ flex: 1 }}>
            <FormItem label="신청 오픈일" required error={errors.openDate}>
              <TextField
                type="date"
                value={form.openDate}
                onChange={(e) => setForm({ ...form, openDate: e.target.value })}
              />
            </FormItem>
          </FlexBox>
          <FlexBox style={{ flex: 1 }}>
            <FormItem label="모집 마감일" required error={errors.deadline}>
              <TextField
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </FormItem>
          </FlexBox>
        </FlexBox>

        <FormItem label="신청 인원 제한">
          <TextField
            type="number"
            placeholder="비워두면 인원 제한 없음"
            value={form.capacity === null ? '' : String(form.capacity)}
            onChange={(e) =>
              setForm({ ...form, capacity: e.target.value === '' ? null : Number(e.target.value) })
            }
            style={{ width: 200 }}
          />
        </FormItem>

        <FormItem label="행사 정보 라벨" required error={errors.infoLabels}>
          <InfoLabelsEditor
            value={form.infoLabels}
            onChange={(infoLabels) => setForm({ ...form, infoLabels })}
          />
        </FormItem>

        <FormItem label="행사 소개글">
          <TextArea
            placeholder="행사에 대한 소개글을 입력하세요."
            value={form.description}
            width="100%"
            minRows={4}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </FormItem>

        <FormItem label="행사 신청 폼">
          <FlexBox flexDirection="column" style={{ gap: 12 }}>
            <Typography variant="caption1" color="semantic.label.alternative">
              신청 시 사용자의 이름, 학번, 학생회비 납부 여부, 연락처는 자동으로 저장돼요.
            </Typography>
            <ApplicationFormBuilder
              value={form.formFields}
              onChange={(formFields) => setForm({ ...form, formFields })}
            />
          </FlexBox>
        </FormItem>

        <FlexBox justifyContent="flex-end" style={{ gap: 8, marginTop: 8 }}>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
          <Button variant="outlined" color="assistive" onClick={() => navigate('/events')}>
            취소
          </Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default EventFormPage
