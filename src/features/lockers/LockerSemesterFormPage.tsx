import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Option, Select, TextField, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import { useLockers } from './store'
import { formatSemesterLabel } from './types'

const emptyForm = {
  year: new Date().getFullYear(),
  term: 1 as 1 | 2,
  applyStartDate: '',
  applyEndDate: '',
  useStartDate: '',
  useEndDate: '',
}

function LockerSemesterFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { semesters, addSemester, updateSemester } = useLockers()
  const toast = useToast()

  const existing = id ? semesters.find((semester) => semester.id === id) : undefined
  const [form, setForm] = useState(() =>
    existing
      ? {
          year: existing.year,
          term: existing.term,
          applyStartDate: existing.applyStartDate,
          applyEndDate: existing.applyEndDate,
          useStartDate: existing.useStartDate,
          useEndDate: existing.useEndDate,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const goBackToSchedule = () => navigate('/lockers?tab=schedule')

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.applyStartDate || !form.applyEndDate) {
      nextErrors.apply = '신청 시작일과 마감일을 모두 입력해주세요.'
    } else if (form.applyStartDate > form.applyEndDate) {
      nextErrors.apply = '신청 마감일은 신청 시작일 이후여야 해요.'
    }
    if (!form.useStartDate || !form.useEndDate) {
      nextErrors.use = '사용 시작일과 종료일을 모두 입력해주세요.'
    } else if (form.useStartDate > form.useEndDate) {
      nextErrors.use = '사용 종료일은 사용 시작일 이후여야 해요.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateSemester(id, form)
      toast({ content: `${formatSemesterLabel(form)} 일정이 수정되었어요.`, variant: 'positive' })
    } else {
      addSemester(form)
      toast({ content: `${formatSemesterLabel(form)} 신청 일정이 등록되었어요.`, variant: 'positive' })
    }
    goBackToSchedule()
  }

  return (
    <>
      <PageHeader
        title={isEdit ? '신청 일정 수정' : '새 학기 신청 일정 등록'}
        description="사물함 신청 기간과 사용 가능 기간을 설정해요."
      />

      <FlexBox flexDirection="column" style={{ gap: 32, maxWidth: 520 }}>
        <FlexBox style={{ gap: 16 }}>
          <FlexBox style={{ width: 160 }}>
            <FormItem label="연도" required>
              <TextField
                type="number"
                value={String(form.year)}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) || form.year })}
              />
            </FormItem>
          </FlexBox>
          <FlexBox style={{ width: 160 }}>
            <FormItem label="학기" required>
              <Select
                value={String(form.term)}
                onChange={(v) => setForm({ ...form, term: Number(v) as 1 | 2 })}
              >
                <Option value="1">1학기</Option>
                <Option value="2">2학기</Option>
              </Select>
            </FormItem>
          </FlexBox>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 8 }}>
          <Typography variant="label1" weight="bold">
            신청 기간
          </Typography>
          <FlexBox alignItems="center" style={{ gap: 8 }}>
            <FlexBox style={{ flex: 1 }}>
              <FormItem label="신청 시작일" required error={errors.apply}>
                <TextField
                  type="date"
                  value={form.applyStartDate}
                  onChange={(e) => setForm({ ...form, applyStartDate: e.target.value })}
                />
              </FormItem>
            </FlexBox>
            <Typography variant="body1" color="semantic.label.alternative" style={{ marginTop: 26 }}>
              ~
            </Typography>
            <FlexBox style={{ flex: 1 }}>
              <FormItem label="신청 마감일" required>
                <TextField
                  type="date"
                  value={form.applyEndDate}
                  onChange={(e) => setForm({ ...form, applyEndDate: e.target.value })}
                />
              </FormItem>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 8 }}>
          <Typography variant="label1" weight="bold">
            사용 가능 기간
          </Typography>
          <FlexBox alignItems="center" style={{ gap: 8 }}>
            <FlexBox style={{ flex: 1 }}>
              <FormItem label="사용 시작일" required error={errors.use}>
                <TextField
                  type="date"
                  value={form.useStartDate}
                  onChange={(e) => setForm({ ...form, useStartDate: e.target.value })}
                />
              </FormItem>
            </FlexBox>
            <Typography variant="body1" color="semantic.label.alternative" style={{ marginTop: 26 }}>
              ~
            </Typography>
            <FlexBox style={{ flex: 1 }}>
              <FormItem label="사용 종료일" required>
                <TextField
                  type="date"
                  value={form.useEndDate}
                  onChange={(e) => setForm({ ...form, useEndDate: e.target.value })}
                />
              </FormItem>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
          <Button variant="outlined" color="assistive" onClick={goBackToSchedule}>
            취소
          </Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default LockerSemesterFormPage
