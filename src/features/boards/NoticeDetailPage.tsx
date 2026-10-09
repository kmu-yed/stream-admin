import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import FormSection from '../../components/common/FormSection'
import StatusBadge from '../../components/common/StatusBadge'
import { useBoards } from './store'

function NoticeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notices } = useBoards()
  const notice = notices.find((item) => item.id === id)

  if (!notice) {
    return <>
      <FormSection style={{ maxWidth: 800 }}>
        <Typography variant="body1" color="semantic.label.alternative">공지를 찾을 수 없어요.</Typography>
        <Button variant="outlined" color="assistive" onClick={() => navigate('/notices')}>목록으로</Button>
      </FormSection>
    </>
  }

  return <>
    <FormSection style={{ maxWidth: 800 }}>
      <FlexBox alignItems="center" style={{ gap: 8 }}>
        {notice.pinned && <img src="/icons/Shape.svg" alt="상단 고정" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
        <StatusBadge label={notice.category} tone={notice.category === '제휴' ? 'info' : 'neutral'} />
      </FlexBox>
      <Typography variant="title2" weight="bold">{notice.title}</Typography>
      <Typography variant="body2" color="semantic.label.alternative">등록일 {notice.createdAt}</Typography>
      <div style={{ borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 24, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.7 }}>
        <Typography variant="body1">{notice.content}</Typography>
      </div>
      {notice.images.length > 0 && <FlexBox flexDirection="column" style={{ gap: 12 }}>
        {notice.images.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`공지 이미지 ${index + 1}`} style={{ display: 'block', width: '100%', maxWidth: 640, height: 'auto', borderRadius: 12 }} />)}
      </FlexBox>}
      <FlexBox className="app-form-actions" justifyContent="flex-end" style={{ gap: 8 }}>
        <Button variant="outlined" color="assistive" onClick={() => navigate('/notices')}>목록으로</Button>
        <Button variant="solid" color="primary" onClick={() => navigate(`/notices/${notice.id}/edit`)}>수정</Button>
      </FlexBox>
    </FormSection>
  </>
}

export default NoticeDetailPage
