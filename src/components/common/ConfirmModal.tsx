import {
  Button,
  Modal,
  ModalContainer,
  ModalContent,
  ModalContentItem,
  ModalDescription,
  ModalHeading,
} from '@wanteddev/wds'

type ConfirmModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'negative'
  onConfirm: () => void
  onCancel?: () => void
}

function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContainer size="small">
        <ModalContent>
          <ModalContentItem>
            <ModalHeading>{title}</ModalHeading>
            {description && <ModalDescription>{description}</ModalDescription>}
          </ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              variant="outlined"
              color="assistive"
              onClick={() => {
                onCancel?.()
                onOpenChange(false)
              }}
            >
              {cancelLabel}
            </Button>
            <Button
              variant="solid"
              color="primary"
              style={
                tone === 'negative'
                  ? { background: 'var(--semantic-status-negative)' }
                  : undefined
              }
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </Button>
          </ModalContentItem>
        </ModalContent>
      </ModalContainer>
    </Modal>
  )
}

export default ConfirmModal
