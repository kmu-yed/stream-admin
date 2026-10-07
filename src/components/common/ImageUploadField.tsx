import { useState } from 'react'
import { IconClose, IconImage } from '@wanteddev/wds-icon'
import { FlexBox, IconButton, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Thumbnail, Typography } from '@wanteddev/wds'

type ImageUploadFieldProps = {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxCount?: number
  previewSize?: number
  accept?: string
  editable?: boolean
  onRemoveRequest?: (index: number) => void
}

function ImageUploadField({ value, onChange, multiple = false, maxCount, previewSize = 96, accept = 'image/*', editable = true, onRemoveRequest }: ImageUploadFieldProps) {
  const canAddMore = maxCount === undefined || value.length < maxCount
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const urls = Array.from(files).map((file) => URL.createObjectURL(file))
    onChange(multiple ? [...value, ...urls] : [urls[0]])
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <FlexBox style={{ gap: 12, flexWrap: 'wrap' }}>
      {value.map((url, index) => (
        <FlexBox key={url} style={{ position: 'relative' }} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
          <button type="button" aria-label="이미지 크게 보기" onClick={() => setPreviewUrl(url)} style={{ width: previewSize, height: previewSize, padding: 0, border: 0, borderRadius: 12, background: 'transparent', cursor: 'zoom-in', overflow: 'hidden', position: 'relative' }}>
            <Thumbnail src={url} alt="업로드한 이미지 미리보기" ratio="1:1" width={previewSize} border radius />
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.48)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: hoveredIndex === index ? 1 : 0, transition: 'opacity .16s ease' }}>미리보기</span>
          </button>
          {editable && <IconButton
            variant="normal"
            size="small"
            onClick={() => onRemoveRequest ? onRemoveRequest(index) : removeAt(index)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              background: '#fff',
              color: '#171717',
              border: '1px solid var(--semantic-line-normal-normal)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.16)',
            }}
          >
            <IconClose width={14} height={14} />
          </IconButton>}
        </FlexBox>
      ))}

      {editable && canAddMore && (
        <FlexBox
          as="label"
          className="app-hoverable"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          style={{
            width: previewSize,
            height: previewSize,
            borderRadius: 12,
            border: '1px dashed var(--semantic-line-normal-normal)',
            cursor: 'pointer',
            gap: 4,
          }}
        >
          <IconImage width={20} height={20} style={{ color: 'var(--semantic-label-alternative)' }} />
          <Typography variant="caption1" color="semantic.label.alternative">
            {value.length > 0 ? '추가' : '업로드'}
          </Typography>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </FlexBox>
      )}

      <Modal open={Boolean(previewUrl)} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <ModalContainer size="xlarge">
          <ModalContent>
            <ModalContentItem style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ModalHeading>이미지 미리보기</ModalHeading>
              <IconButton variant="normal" size="small" aria-label="미리보기 닫기" onClick={() => setPreviewUrl(null)}><IconClose /></IconButton>
            </ModalContentItem>
            <ModalContentItem alignItems="center" justifyContent="center" style={{ padding: 0, background: 'var(--semantic-fill-normal)', borderRadius: 12, overflow: 'hidden' }}>
              {previewUrl && <img src={previewUrl} alt="업로드한 이미지 원본 미리보기" style={{ display: 'block', maxWidth: '100%', maxHeight: '72vh', width: 'auto', height: 'auto', objectFit: 'contain' }} />}
            </ModalContentItem>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </FlexBox>
  )
}

export default ImageUploadField
