import { Button, FlexBox } from '@wanteddev/wds'

export default function FormActions({ onCancel, onSubmit, submitLabel }: { onCancel: () => void; onSubmit: () => void; submitLabel: string }) {
  return <FlexBox className="app-form-actions" justifyContent="flex-end" style={{ gap: 8 }}>
    <Button variant="outlined" color="assistive" onClick={onCancel}>취소</Button>
    <Button variant="solid" color="primary" onClick={onSubmit}>{submitLabel}</Button>
  </FlexBox>
}
