import { Button } from '@wanteddev/wds'
import EmptyState from './EmptyState'
import FormSection from './FormSection'

type NotFoundStateProps = {
  entity: string
  onBack: () => void
}

function NotFoundState({ entity, onBack }: NotFoundStateProps) {
  return <FormSection style={{ maxWidth: 800 }}>
    <EmptyState
      message={`${entity}를 찾을 수 없어요.`}
      description="삭제되었거나 주소가 변경되었을 수 있어요."
      action={<Button variant="outlined" color="assistive" onClick={onBack}>목록으로</Button>}
      variant="compact"
      style={{ minHeight: 180 }}
    />
  </FormSection>
}

export default NotFoundState
