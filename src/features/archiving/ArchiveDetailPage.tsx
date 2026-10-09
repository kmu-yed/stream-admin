import { useNavigate, useParams } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import DetailInfoGrid from '../../components/common/DetailInfoGrid'
import FormSection from '../../components/common/FormSection'
import StatusBadge from '../../components/common/StatusBadge'
import { useBoards } from '../boards/store'
import { useArchiving } from './store'

function ArchiveDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { posts } = useArchiving()
  const { notices } = useBoards()
  const post = posts.find((item) => item.id === id)

  if (!post) {
    return <FormSection style={{ maxWidth: 800 }}>
      <Typography variant="body1" color="semantic.label.alternative">게시물을 찾을 수 없어요.</Typography>
      <Button variant="outlined" color="assistive" onClick={() => navigate('/archiving')}>목록으로</Button>
    </FormSection>
  }

  const linkedNotice = notices.find((notice) => `/notices/${notice.id}` === post.linkedPageUrl)

  return <FormSection style={{ maxWidth: 800 }}>
    <StatusBadge label={post.includeInSlangje ? '슬랑제 페이지 노출' : '슬랑제 페이지 비노출'} tone={post.includeInSlangje ? 'positive' : 'neutral'} />
    <Typography variant="title2" weight="bold" style={{ overflowWrap: 'anywhere' }}>{post.title}</Typography>
    <Typography variant="body2" color="semantic.label.alternative">등록일 {post.createdAt}</Typography>

    <div style={{ borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 24 }}>
      <DetailInfoGrid items={[
        { label: '일시', value: post.date },
        { label: '장소', value: post.location },
        { label: '담당부서', value: post.department },
      ]} />
    </div>

    {post.coverImageUrl && <FlexBox flexDirection="column" style={{ gap: 8 }}>
      <Typography variant="body1" weight="bold">대표이미지</Typography>
      <img src={post.coverImageUrl} alt={`${post.title} 대표이미지`} style={{ display: 'block', width: '100%', maxWidth: 640, height: 'auto', borderRadius: 12 }} />
    </FlexBox>}

    <FlexBox flexDirection="column" style={{ gap: 8 }}>
      <Typography variant="body1" weight="bold">활동내용</Typography>
      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.7 }}>{post.content}</Typography>
    </FlexBox>

    {post.photos.length > 0 && <FlexBox flexDirection="column" style={{ gap: 12 }}>
      <Typography variant="body1" weight="bold">활동사진</Typography>
      {post.photos.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${post.title} 활동사진 ${index + 1}`} style={{ display: 'block', width: '100%', maxWidth: 640, height: 'auto', borderRadius: 12 }} />)}
    </FlexBox>}

    {post.linkedPageUrl && <FlexBox flexDirection="column" alignItems="flex-start" style={{ gap: 8, borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 20 }}>
      <Typography variant="body1" weight="bold">관련 공지</Typography>
      <Button variant="outlined" color="assistive" onClick={() => navigate(post.linkedPageUrl!)}>{linkedNotice?.title ?? '관련 공지 보기'}</Button>
    </FlexBox>}

    <FlexBox className="app-form-actions" justifyContent="flex-end" style={{ gap: 8 }}>
      <Button variant="outlined" color="assistive" onClick={() => navigate('/archiving')}>목록으로</Button>
      <Button variant="solid" color="primary" onClick={() => navigate(`/archiving/${post.id}/edit`)}>수정</Button>
    </FlexBox>
  </FormSection>
}

export default ArchiveDetailPage
