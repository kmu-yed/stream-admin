import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  Option,
  RadioGroup,
  RadioGroupItem,
  Select,
  TextArea,
  TextField,
  Typography,
  useToast,
} from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'
import { useHomeBanner } from './store'
import { useBoards } from '../boards/store'
import { type BannerInput, type LandingType } from './types'

const bannerImagePresets = [
  { id: 'notice', label: '일반 공지', src: '/banners/banner-notice.png' },
  { id: 'event', label: '행사', src: '/banners/banner-event.png' },
  { id: 'partnership', label: '제휴', src: '/banners/banner-partnership.png' },
  { id: 'locker', label: '사물함', src: '/banners/banner-locker.png' },
]

function makeEmptyForm(noticeId?: string): BannerInput {
  return {
    category: '기타',
    title: '',
    subtitle: '',
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
          subtitle: existing.subtitle,
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
          category: '기타',
          title: fromNotice ? fromNotice.title : '',
        },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageSource, setImageSource] = useState<'preset' | 'upload'>(() => bannerImagePresets.some((preset) => preset.src === existing?.imageUrl) ? 'preset' : 'upload')

  const goToList = () => navigate('/home-banner')

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = '배너 제목을 입력해주세요.'
    if (!form.subtitle.trim()) nextErrors.subtitle = '부제목을 입력해주세요.'
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

      <FlexBox flexDirection="column" style={{ gap: 20, maxWidth: 640 }}>
        <FlexBox flexDirection="column" style={{ gap: 20, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
        <FormItem label="배너 제목" required error={errors.title}>
          <TextArea
            placeholder="배너에 노출될 제목을 입력하세요"
            value={form.title}
            minRows={2}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormItem>
        <FormItem label="부제목" required error={errors.subtitle}><TextField placeholder="배너에 노출될 부제목을 입력하세요" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></FormItem>
        <FlexBox flexDirection="column" style={{ gap: 6, padding: 20, borderRadius: 16, background: 'var(--semantic-primary-normal)', color: '#fff' }}><Typography variant="title2" weight="bold" style={{ whiteSpace: 'pre-line' }}>{form.title || '일반공지 제목이\n들어가는 자리입니다'}</Typography><Typography variant="body2" style={{ opacity: .78 }}>{form.subtitle || '여긴 부제목이 들어가요'}</Typography></FlexBox>
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 16, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
          <FlexBox flexDirection="column" style={{ gap: 4 }}><Typography variant="label1" weight="bold">배너 이미지</Typography><Typography variant="caption1" color="semantic.label.alternative">선택 · PNG 355 × 261px</Typography></FlexBox>
          <FlexBox style={{ gap: 10, flexWrap: 'wrap' }}>
            {bannerImagePresets.map((preset) => {
              const selected = imageSource === 'preset' && form.imageUrl === preset.src
              return <button className="app-hoverable" key={preset.id} type="button" onClick={() => { setImageSource('preset'); setForm({ ...form, imageUrl: preset.src }) }} style={{ width: 132, padding: 0, overflow: 'hidden', borderRadius: 10, cursor: 'pointer', border: selected ? '2px solid var(--semantic-primary-normal)' : '1px solid var(--semantic-line-normal-normal)', background: 'var(--semantic-background-normal-normal)' }}><img src={preset.src} alt={`${preset.label} 배너 이미지`} style={{ display: 'block', width: '100%', height: 92, objectFit: 'cover' }} /><span style={{ display: 'block', padding: '8px 6px', fontSize: 13, color: 'var(--semantic-label-normal)' }}>{preset.label}</span></button>
            })}
            <button className="app-hoverable" type="button" onClick={() => setImageSource('upload')} style={{ width: 132, padding: 0, borderRadius: 10, cursor: 'pointer', border: imageSource === 'upload' ? '2px solid var(--semantic-primary-normal)' : '1px solid var(--semantic-line-normal-normal)', background: 'var(--semantic-background-normal-normal)', color: 'var(--semantic-label-alternative)' }}><FlexBox flexDirection="column" alignItems="center" justifyContent="center" style={{ height: 92, fontSize: 22 }}>+</FlexBox><span style={{ display: 'block', padding: '8px 6px', fontSize: 13 }}>직접 업로드</span></button>
          </FlexBox>
          {imageSource === 'upload' && <ImageUploadField value={form.imageUrl ? [form.imageUrl] : []} onChange={(urls) => setForm({ ...form, imageUrl: urls[0] })} multiple={false} maxCount={1} accept="image/png" previewSize={160} />}
        </FlexBox>

        <FlexBox flexDirection="column" style={{ gap: 16, padding: 24, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16 }}>
          <Typography variant="label1" weight="bold">
            노출 기간
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
