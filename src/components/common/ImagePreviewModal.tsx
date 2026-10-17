import { IconButton, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading } from '@wanteddev/wds'
import { IconClose } from '@wanteddev/wds-icon'

type ImagePreviewModalProps = {
  imageUrl: string | null
  title?: string
  alt?: string
  onClose: () => void
}

function ImagePreviewModal({ imageUrl, title = '이미지 미리보기', alt = '이미지 원본 미리보기', onClose }: ImagePreviewModalProps) {
  return <Modal open={Boolean(imageUrl)} onOpenChange={(open) => !open && onClose()}>
    <ModalContainer size="xlarge">
      <ModalContent>
        <ModalContentItem style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ModalHeading>{title}</ModalHeading>
          <IconButton variant="normal" size="small" aria-label="미리보기 닫기" onClick={onClose}><IconClose /></IconButton>
        </ModalContentItem>
        <ModalContentItem alignItems="center" justifyContent="center" style={{ padding: 0, background: 'var(--semantic-fill-normal)', borderRadius: 12, overflow: 'hidden' }}>
          {imageUrl && <img src={imageUrl} alt={alt} style={{ display: 'block', maxWidth: '100%', maxHeight: '72vh', width: 'auto', height: 'auto', objectFit: 'contain' }} />}
        </ModalContentItem>
      </ModalContent>
    </ModalContainer>
  </Modal>
}

export default ImagePreviewModal
