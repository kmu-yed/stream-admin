import { FlexBox, Typography } from '@wanteddev/wds'
import { IconFlag } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'

function SlangjePage() {
  return (
    <>
      <PageHeader title="슬랑제 게시물 관리" description="메뉴만 우선 확정되었으며, 세부 기획은 아직 논의 중이에요." />

      <FlexBox
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          gap: 12,
          padding: '64px 24px',
          borderRadius: 16,
          border: '1px dashed var(--semantic-line-normal-normal)',
          textAlign: 'center',
        }}
      >
        <IconFlag width={32} height={32} style={{ color: 'var(--semantic-label-alternative)' }} />
        <Typography variant="title3" weight="bold">
          세부 기획 확정 후 화면이 구성돼요.
        </Typography>
        <Typography variant="body2" color="semantic.label.alternative" style={{ maxWidth: 420 }}>
          아카이빙 게시물 관리와의 통합 여부가 결정되지 않아, 현재는 사이드바 메뉴만 우선 배치했어요. 기획이 확정되면
          아카이빙과 동일한 등록/수정/삭제 흐름으로 이어서 구현할 예정이에요.
        </Typography>
      </FlexBox>
    </>
  )
}

export default SlangjePage
