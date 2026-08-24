import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  Option,
  RadioGroup,
  RadioGroupItem,
  Select,
  TextField,
  Typography,
  useToast,
} from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'
import StatusBadge from '../../components/common/StatusBadge'
import { useHomeBanner } from './store'
import { useBoards } from '../boards/store'
import { getBannerBadge, type BannerCategory, type BannerInput, type LandingType } from './types'

const categories: BannerCategory[] = ['제휴', '슬랑제', '간식행사', '체육대회', '해오름제', '사물함', '동문패널톡', '기타']

function makeEmptyForm(noticeId?: string): BannerInput {
  return {
    category: '기타',
    title: '',
    imageUrl: undefined,
    logoUrl: undefined,
    landingType: noticeId ? 'notice' : 'external',
    noticeId,
    externalUrl: '',
    startDate: '',
    endDate: '',
  }
}

function HomeBannerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const { banners, addBanner, updateBanner } = useHomeBanner()
  const { notices } = useBoards()
  const toast = useToast()

  const fromNoticeId = searchParams.get('fromNotice') ?? undefined
  const fromNotice = fromNoticeId ? notices.find((n) => n.id === fromNoticeId) : undefined

  const existing = id ? banners.find((banner) => banner.id === id) : undefined
  const [form, setForm] = useState<BannerInput>(() =>
    existing
      ? {
          category: existing.category,
          title: existing.title,
          imageUrl: existing.imageUrl,
          logoUrl: existing.logoUrl,
          landingType: existing.landingType,
          noticeId: existing.noticeId,
          externalUrl: existing.externalUrl,
          startDate: existing.startDate,
          endDate: existing.endDate,
        }
      : {
          ...makeEmptyForm(fromNoticeId),
          category: fromNotice?.category === '제휴' ? '제휴' : '기타',
          title: fromNotice ? fromNotice.title : '',
        },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const goToList = () => navigate('/home-banner')

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '배너 제목을 입력해주세요.'
    if (!form.startDate || !form.endDate) nextErrors.period = '노출 시작일과 종료일을 모두 입력해주세요.'
    else if (form.startDate > form.endDate) nextErrors.period = '종료일은 시작일 이후여야 해요.'
    if (form.landingType === 'notice' && !form.noticeId) nextErrors.landing = '연결할 공지를 선택해주세요.'
    if (form.landingType === 'external' && !form.externalUrl?.trim()) nextErrors.landing = '외부 링크 주소를 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && id) {
      updateBanner(id, form)
      toast({ content: '배너가 수정되었어요.', variant: 'positive' })
    } else {
      addBanner(form)
      toast({ content: '배너가 등록되었어요.', variant: 'positive' })
    }
    goToList()
  }

  return (
    <>
      <PageHeader
        title={isEdit ? '배너 수정' : '새 배너 등록'}
        description={
          fromNotice
            ? `"${fromNotice.title}" 공지에 연결되는 배너를 등록해요.`
            : '홈 화면에 노출될 공지 배너를 등록해요.'
        }
      />

      <FlexBox flexDirection="column" style={{ gap: 32, maxWidth: 640 }}>
        <FlexBox style={{ gap: 16 }}>
          <FlexBox style={{ width: 200 }}>
            <FormItem label="카테고리" required>
              <Select
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v as BannerCategory })}
              >
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </FlexBox>
          <FlexBox flexDirection="column" style={{ gap: 6, justifyContent: 'flex-end' }}>
            <Typography variant="label2" color="semantic.label.alternative">
              뱃지 표시
            </Typography>
            <StatusBadge label={getBannerBadge(form.category)} tone={form.category === '제휴' ? 'info' : 'neutral'} />
          </FlexBox>
        </FlexBox>

        <FormItem label="배너 제목" required error={errors.title}>
          <TextField
            placeholder="배너에 노출될 제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormItem>

        <FormItem label="배너 이미지 (선택)">
          <ImageUploadField
            value={form.imageUrl ? [form.imageUrl] : []}
            onChange={(urls) => setForm({ ...form, imageUrl: urls[0] })}
            multiple={false}
            maxCount={1}
          />
        </FormItem>

        {form.category === '제휴' && (
          <FormItem label="기업 로고 (등록 시 배너가 자동 완성돼요)">
            <ImageUploadField
              value={form.logoUrl ? [form.logoUrl] : []}
              onChange={(urls) => setForm({ ...form, logoUrl: urls[0] })}
              multiple={false}
              maxCount={1}
            />
          </FormItem>
        )}

        <FlexBox flexDirection="column" style={{ gap: 8 }}>
          <Typography variant="label1" weight="bold">
            노출 기간
          </Typography>
          <Typography variant="caption1" color="semantic.label.alternative">
            종료일이 지나면 자동으로 비노출 처리돼요.
          </Typography>
          <FlexBox style={{ gap: 16 }}>
            <FlexBox style={{ flex: 1 }}>
              <FormItem label="시작일" required error={errors.period}>
                <TextField
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </FormItem>
            </FlexBox>
            <FlexBox style={{ flex: 1 }}>
              <FormItem label="종료일" required>
                <TextField
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </FormItem>
            </FlexBox>
          </FlexBox>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 8 }}>
          <Typography variant="label1" weight="bold">
            클릭 시 랜딩 처리
          </Typography>
          <RadioGroup
            value={form.landingType}
            onValueChange={(v) => setForm({ ...form, landingType: v as LandingType })}
          >
            <FlexBox flexDirection="column" style={{ gap: 12 }}>
              <FlexBox alignItems="center" style={{ gap: 8 }}>
                <RadioGroupItem value="notice" />
                <Typography
                  variant="body2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setForm({ ...form, landingType: 'notice' })}
                >
                  공지 상세 연결
                </Typography>
              </FlexBox>
              {form.landingType === 'notice' && (
                <FlexBox style={{ paddingLeft: 28, width: 320 }}>
                  <Select
                    value={form.noticeId ?? ''}
                    onChange={(v) => setForm({ ...form, noticeId: v })}
                  >
                    {notices.map((notice) => (
                      <Option key={notice.id} value={notice.id}>
                        {notice.title}
                      </Option>
                    ))}
                  </Select>
                </FlexBox>
              )}

              <FlexBox alignItems="center" style={{ gap: 8 }}>
                <RadioGroupItem value="external" />
                <Typography
                  variant="body2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setForm({ ...form, landingType: 'external' })}
                >
                  외부 링크
                </Typography>
              </FlexBox>
              {form.landingType === 'external' && (
                <FlexBox style={{ paddingLeft: 28, width: 400 }}>
                  <TextField
                    placeholder="https://"
                    value={form.externalUrl ?? ''}
                    onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  />
                </FlexBox>
              )}
            </FlexBox>
          </RadioGroup>
          {errors.landing && (
            <Typography variant="label2" color="semantic.status.negative">
              {errors.landing}
            </Typography>
          )}
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
    </>
  )
}

export default HomeBannerFormPage
