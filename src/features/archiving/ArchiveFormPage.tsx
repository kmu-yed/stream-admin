import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, TextArea, TextField, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'
import { useArchiving } from './store'
import type { ArchivePostInput } from './types'

const emptyForm: ArchivePostInput = {
  title: '',
  coverImageUrl: undefined,
  photos: [],
  date: '',
  location: '',
  department: '',
  content: '',
  linkedPageUrl: '',
}

function ArchiveFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { posts, addPost, updatePost } = useArchiving()
  const toast = useToast()

  const existing = id ? posts.find((post) => post.id === id) : undefined
  const [form, setForm] = useState<ArchivePostInput>(() =>
    existing
      ? {
          title: existing.title,
          coverImageUrl: existing.coverImageUrl,
          photos: existing.photos,
          date: existing.date,
          location: existing.location,
          department: existing.department,
          content: existing.content,
          linkedPageUrl: existing.linkedPageUrl,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const goToList = () => navigate('/archiving')

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '제목을 입력해주세요.'
    if (!form.date) nextErrors.date = '일시를 입력해주세요.'
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
    goToList()
  }

  return (
    <>
      <PageHeader
        title={isEdit ? '아카이빙 게시물 수정' : '새 아카이빙 게시물 등록'}
        description="학생회 활동 기록을 아카이빙해요."
      />

      <FlexBox flexDirection="column" style={{ gap: 24, maxWidth: 640, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
        <FormItem label="제목" required error={errors.title}>
          <TextField
            placeholder="게시물 제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormItem>

        <FormItem label="대표이미지">
          <ImageUploadField
            value={form.coverImageUrl ? [form.coverImageUrl] : []}
            onChange={(urls) => setForm({ ...form, coverImageUrl: urls[0] })}
            multiple={false}
            maxCount={1}
          />
        </FormItem>

        <FormItem label="활동사진 (복수 등록 가능)">
          <ImageUploadField
            value={form.photos}
            onChange={(urls) => setForm({ ...form, photos: urls })}
            multiple
          />
        </FormItem>

        <FlexBox style={{ gap: 16 }}>
          <FlexBox style={{ flex: 1 }}>
            <FormItem label="일시" required error={errors.date}>
              <TextField
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormItem>
          </FlexBox>
          <FlexBox style={{ flex: 1 }}>
            <FormItem label="장소" required error={errors.location}>
              <TextField
                placeholder="예: 중앙광장"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </FormItem>
          </FlexBox>
          <FlexBox style={{ flex: 1 }}>
            <FormItem label="담당부서" required error={errors.department}>
              <TextField
                placeholder="예: 문화기획국"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </FormItem>
          </FlexBox>
        </FlexBox>

        <FormItem label="활동내용" required error={errors.content}>
          <TextArea
            placeholder="활동 내용을 입력하세요"
            value={form.content}
            width="100%"
            minRows={6}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </FormItem>

        <FormItem label="관련페이지 연결 (Stream 게시판 내 페이지, 선택)">
          <TextField
            placeholder="https://stream.ac.kr/board/..."
            value={form.linkedPageUrl}
            onChange={(e) => setForm({ ...form, linkedPageUrl: e.target.value })}
          />
        </FormItem>

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
          <Button variant="outlined" color="assistive" onClick={goToList}>
            취소
          </Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default ArchiveFormPage
