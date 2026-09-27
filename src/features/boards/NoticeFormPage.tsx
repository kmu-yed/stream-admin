import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  Option,
  Select,
  Switch,
  TextArea,
  TextField,
  Typography,
  useToast,
} from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useBoards } from './store'
import type { NoticeCategory, NoticeInput } from './types'

const emptyForm: NoticeInput = {
  category: '일반',
  title: '',
  content: '',
  thumbnailUrl: undefined,
  pinned: false,
}

function NoticeFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { notices, addNotice, updateNotice } = useBoards()
  const toast = useToast()

  const existing = id ? notices.find((notice) => notice.id === id) : undefined
  const [form, setForm] = useState<NoticeInput>(() =>
    existing
      ? {
          category: existing.category,
          title: existing.title,
          content: existing.content,
          thumbnailUrl: existing.thumbnailUrl,
          pinned: existing.pinned,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createdId, setCreatedId] = useState<string | null>(null)
  const navigatingAwayRef = useRef(false)

  const goToList = () => navigate('/notices')

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '제목을 입력해주세요.'
    if (!form.content.trim()) nextErrors.content = '본문을 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateNotice(id, form)
      toast({ content: '공지가 수정되었어요.', variant: 'positive' })
      goToList()
    } else {
      const notice = addNotice(form)
      setCreatedId(notice.id)
    }
  }

  return (
    <>
      <PageHeader title={isEdit ? '공지 수정' : '새 공지 등록'} description="게시판에 노출될 공지를 작성해요." />

      <FlexBox flexDirection="column" style={{ gap: 24, maxWidth: 640, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
        <FlexBox style={{ gap: 16 }}>
          <FlexBox style={{ width: 200 }}>
            <FormItem label="카테고리" required>
              <Select
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v as NoticeCategory })}
              >
                <Option value="일반">일반</Option>
                <Option value="제휴">제휴</Option>
              </Select>
            </FormItem>
          </FlexBox>
        </FlexBox>

        <FormItem label="제목" required error={errors.title}>
          <TextField
            placeholder="공지 제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormItem>

        <FormItem label="본문" required error={errors.content}>
          <TextArea
            placeholder="공지 내용을 입력하세요"
            value={form.content}
            width="100%"
            minRows={6}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </FormItem>

        <FormItem label="카드뉴스 / 썸네일 (선택)">
          <ImageUploadField
            value={form.thumbnailUrl ? [form.thumbnailUrl] : []}
            onChange={(urls) => setForm({ ...form, thumbnailUrl: urls[0] })}
            multiple={false}
            maxCount={1}
          />
        </FormItem>

        <FlexBox
          as="label"
          alignItems="center"
          style={{ gap: 8, cursor: 'pointer' }}
        >
          <Switch checked={form.pinned} onCheckedChange={(checked) => setForm({ ...form, pinned: checked })} />
          <Typography variant="body2">상단 고정(핀) 처리</Typography>
        </FlexBox>

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
          <Button variant="outlined" color="assistive" onClick={goToList}>
            취소
          </Button>
        </FlexBox>
      </FlexBox>

      <ConfirmModal
        open={Boolean(createdId)}
        onOpenChange={(open) => {
          if (!open && !navigatingAwayRef.current) goToList()
        }}
        title="공지 등록이 완료되었어요."
        description="홈 배너도 설정할까요?"
        confirmLabel="예"
        cancelLabel="아니오"
        onConfirm={() => {
          navigatingAwayRef.current = true
          navigate(`/home-banner/new?fromNotice=${createdId}`)
        }}
        onCancel={() => {
          navigatingAwayRef.current = true
          goToList()
        }}
      />
    </>
  )
}

export default NoticeFormPage
