import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import DetailInfoGrid from '../../components/common/DetailInfoGrid'
import FormSection from '../../components/common/FormSection'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import { useBoards } from '../boards/store'
import { useHomeBanner } from './store'
import { getBannerBadge, getBannerExposureStatus, type BannerExposureStatus } from './types'

const exposureTone: Record<BannerExposureStatus, BadgeTone> = {
  노출중: 'positive',
  노출예정: 'info',
  노출종료: 'neutral',
}

function HomeBannerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { banners } = useHomeBanner()
  const { notices } = useBoards()
  const banner = banners.find((item) => item.id === id)

  if (!banner) {
    return <FormSection style={{ maxWidth: 800 }}>
      <Typography variant="body1" color="semantic.label.alternative">배너를 찾을 수 없어요.</Typography>
      <Button variant="outlined" color="assistive" onClick={() => navigate('/home-banner')}>목록으로</Button>
    </FormSection>
  }

  const status = getBannerExposureStatus(banner)
  const linkedNotice = notices.find((notice) => notice.id === banner.noticeId)
  const listPath = status === '노출종료' ? '/home-banner?tab=past' : '/home-banner?tab=active'

  return <FormSection style={{ maxWidth: 800 }}>
    <FlexBox alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
      <StatusBadge label={getBannerBadge(banner.category)} tone={banner.category === '제휴' ? 'info' : 'neutral'} />
      <StatusBadge label={status} tone={exposureTone[status]} />
    </FlexBox>
    <Typography variant="title2" weight="bold" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{banner.title}</Typography>
    <Typography variant="body1" color="semantic.label.alternative" style={{ overflowWrap: 'anywhere' }}>{banner.subtitle}</Typography>
    <Typography variant="body2" color="semantic.label.alternative">등록일 {banner.createdAt}</Typography>

    {banner.imageUrl && <img src={banner.imageUrl} alt={`${banner.title} 배너 이미지`} style={{ display: 'block', width: '100%', maxWidth: 640, height: 'auto', borderRadius: 12 }} />}

    <div style={{ borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 24 }}>
      <DetailInfoGrid items={[
        { label: '카테고리', value: banner.category },
        { label: '노출 기간', value: `${banner.startDate} ~ ${banner.endDate}` },
        { label: '클릭 시 랜딩', value: banner.landingType === 'notice' ? '공지 상세 연결' : '외부 링크' },
        { label: '연결 대상', value: banner.landingType === 'notice' ? (linkedNotice?.title ?? '연결된 공지를 찾을 수 없어요.') : (banner.externalUrl || '-') },
      ]} />
    </div>

    {banner.logoUrl && <FlexBox flexDirection="column" alignItems="flex-start" style={{ gap: 8 }}>
      <Typography variant="body1" weight="bold">로고</Typography>
      <img src={banner.logoUrl} alt={`${banner.title} 로고`} style={{ display: 'block', maxWidth: 160, maxHeight: 80, objectFit: 'contain' }} />
    </FlexBox>}

    {linkedNotice && banner.landingType === 'notice' && <FlexBox justifyContent="flex-end">
      <Button variant="outlined" color="assistive" onClick={() => navigate(`/notices/${linkedNotice.id}`)}>연결된 공지 보기</Button>
    </FlexBox>}

    <FlexBox className="app-form-actions" justifyContent="flex-end" style={{ gap: 8 }}>
      <Button variant="outlined" color="assistive" onClick={() => navigate(listPath)}>목록으로</Button>
      <Button variant="solid" color="primary" onClick={() => navigate(`/home-banner/${banner.id}/edit`)}>수정</Button>
    </FlexBox>
  </FormSection>
}

export default HomeBannerDetailPage
