import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Checkbox, DatePicker, FlexBox, Option, Select, TextArea, TextField, Typography, useToast, type DateType } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import useFormDraft from '../../components/common/useFormDraft'
import FormActions from '../../components/common/FormActions'
import FormItem from '../../components/common/FormItem'
import FormSection from '../../components/common/FormSection'
import ImageUploadField from '../../components/common/ImageUploadField'
import NotFoundState from '../../components/common/NotFoundState'
import FormInfoRow from '../../components/common/FormInfoRow'
import { useArchiving } from './store'
import type { ArchivePostInput } from './types'
import { useBoards } from '../boards/store'

const emptyForm: ArchivePostInput = {
  title: '',
  coverImageUrl: undefined,
  photos: [],
  date: '',
  location: '',
  department: '',
  content: '',
  linkedPageUrl: '',
  includeInSlangje: false,
}

function toDateValue(value: DateType) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function ArchiveFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { posts, addPost, updatePost } = useArchiving()
  const { notices } = useBoards()
  const toast = useToast()

  const existing = id ? posts.find((post) => post.id === id) : undefined
  const [form, setForm] = useState<ArchivePostInput>(() =>
    existing
      ? {
          title: existing.title,
          coverImageUrl: existing.coverImageUrl ?? existing.photos[0],
          photos: existing.coverImageUrl && !existing.photos.includes(existing.coverImageUrl)
            ? [existing.coverImageUrl, ...existing.photos]
            : existing.photos,
          date: existing.date,
          endDate: existing.endDate,
          location: existing.location,
          department: existing.department,
          content: existing.content,
          linkedPageUrl: existing.linkedPageUrl,
          includeInSlangje: existing.includeInSlangje,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasPeriod, setHasPeriod] = useState(Boolean(existing?.endDate))

  const goToList = () => navigate('/archiving')

  const updatePhotos = (photos: string[]) => {
    setForm((current) => ({
      ...current,
      photos,
      coverImageUrl: photos.includes(current.coverImageUrl ?? '') ? current.coverImageUrl : photos[0],
    }))
  }

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '제목을 입력해주세요.'
    if (!form.date) nextErrors.date = '날짜를 선택해주세요.'
    if (hasPeriod && !form.endDate) nextErrors.endDate = '종료일을 선택해주세요.'
    if (hasPeriod && form.endDate && form.date > form.endDate) nextErrors.endDate = '종료일은 시작일 이후여야 해요.'
    if (!form.location.trim()) nextErrors.location = '장소를 입력해주세요.'
    if (!form.department.trim()) nextErrors.department = '담당부서를 입력해주세요.'
    if (!form.content.trim()) nextErrors.content = '활동내용을 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updatePost(id, form)
      toast({ content: '게시물이 수정되었어요.', variant: 'positive' })
    } else {
      addPost(form)
      toast({ content: '게시물이 등록되었어요.', variant: 'positive' })
    }
    markSaved()
    goToList()
  }

  const { markSaved, draftControls, navigationGuard } = useFormDraft(`archive:${id ?? 'new'}`, form, (draft) => { setForm(draft); setHasPeriod(Boolean(draft.endDate)) })
  if (isEdit && !existing) return <NotFoundState entity="게시물" onBack={goToList} />

  return (
    <>
      <PageHeader
        title={isEdit ? '아카이빙 게시물 수정' : '새 게시물 등록'}
        description="학생회 활동 기록을 아카이빙해요."
      />

      {navigationGuard}
      {draftControls}
      <FlexBox flexDirection="column" style={{ gap: 20, maxWidth: 760 }}>
        <FormSection title="기본 정보">
          <FormInfoRow label="제목" error={errors.title}>
            <TextField placeholder="게시물 제목을 입력하세요" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormInfoRow>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <FormInfoRow label="일시" error={errors.date ?? errors.endDate}>
            <FlexBox flexDirection="column" style={{ gap: 12, width: '100%' }}>
              <FlexBox className={hasPeriod ? 'app-date-range' : undefined} alignItems="end" style={{ display: 'grid', gridTemplateColumns: hasPeriod ? 'minmax(0, 1fr) auto minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 12, width: '100%', maxWidth: hasPeriod ? 580 : 280 }}>
                <FlexBox flexDirection="column" style={{ gap: 6, minWidth: 0 }}>
                  {hasPeriod && <Typography variant="caption1" color="semantic.label.alternative">시작일</Typography>}
                  <DatePicker value={form.date ? new Date(`${form.date}T00:00:00`) : undefined} onChange={(value) => setForm({ ...form, date: toDateValue(value) })} format="YYYY-MM-DD" width="100%" />
                </FlexBox>
                {hasPeriod && <>
                  <FlexBox className="app-date-range-separator" alignItems="center" style={{ height: 48 }}><Typography variant="body2" color="semantic.label.alternative">~</Typography></FlexBox>
                  <FlexBox flexDirection="column" style={{ gap: 6, minWidth: 0 }}>
                    <Typography variant="caption1" color="semantic.label.alternative">종료일</Typography>
                    <DatePicker value={form.endDate ? new Date(`${form.endDate}T00:00:00`) : undefined} onChange={(value) => setForm({ ...form, endDate: toDateValue(value) })} format="YYYY-MM-DD" width="100%" />
                  </FlexBox>
                </>}
              </FlexBox>
              <FlexBox as="label" alignItems="center" style={{ gap: 8, cursor: 'pointer', width: 'fit-content' }}>
                <Checkbox checked={hasPeriod} onCheckedChange={(checked) => { setHasPeriod(checked); if (!checked) setForm((prev) => ({ ...prev, endDate: undefined })) }} />
                <Typography variant="body2">기간 설정</Typography>
              </FlexBox>
            </FlexBox>
          </FormInfoRow>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <FormInfoRow label="장소" error={errors.location}>
            <TextField placeholder="예: 중앙광장" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </FormInfoRow>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <FormInfoRow label="담당부서" error={errors.department}>
            <TextField placeholder="예: 문화기획국" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </FormInfoRow>
          <div style={{ height: 1, background: 'var(--semantic-line-normal-normal)', opacity: 0.45 }} />
          <FormInfoRow label="노출 설정">
            <FlexBox as="label" alignItems="center" style={{ gap: 8, minHeight: 48, cursor: 'pointer', width: 'fit-content' }}>
              <Checkbox checked={form.includeInSlangje} onCheckedChange={(checked) => setForm({ ...form, includeInSlangje: checked })} />
              <Typography variant="body2">슬랑제 페이지에 포함</Typography>
            </FlexBox>
          </FormInfoRow>
        </FormSection>

        <FormSection title="이미지">
        <FormItem label="이미지 업로드">
          <ImageUploadField
            value={form.photos}
            onChange={updatePhotos}
            multiple
            previewSize={120}
            selectedIndex={form.photos.indexOf(form.coverImageUrl ?? '')}
            onSelect={(index) => setForm((current) => ({ ...current, coverImageUrl: current.photos[index] }))}
          />
        </FormItem>
        <Typography variant="caption1" color="semantic.label.alternative">사진 왼쪽 위의 원을 눌러 썸네일을 변경할 수 있어요.</Typography>
        </FormSection>

        <FormSection title="상세 내용">
        <FormItem label="활동내용" required error={errors.content}>
          <TextArea
            placeholder="활동 내용을 입력하세요"
            value={form.content}
            width="100%"
            minRows={6}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </FormItem>

        <FormItem label="관련 공지 연결 (선택)">
          <Select value={form.linkedPageUrl?.replace('/notices/', '') ?? ''} onChange={(value) => setForm({ ...form, linkedPageUrl: value ? `/notices/${value}` : '' })} style={{ width: '100%' }}>
            <Option value="">연결하지 않음</Option>
            {notices.map((notice) => <Option key={notice.id} value={notice.id}>{notice.title} · {notice.category}</Option>)}
          </Select>
        </FormItem>
        </FormSection>

        <FormActions onCancel={goToList} onSubmit={handleSubmit} submitLabel={isEdit ? '수정 완료' : '등록하기'} />
      </FlexBox>
    </>
  )
}

export default ArchiveFormPage
