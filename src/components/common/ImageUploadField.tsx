import { useState } from 'react'
import { IconClose, IconImage } from '@wanteddev/wds-icon'
import { FlexBox, IconButton, Thumbnail, Typography } from '@wanteddev/wds'
import ImagePreviewModal from './ImagePreviewModal'

type ImageUploadFieldProps = {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxCount?: number
  previewSize?: number
  accept?: string
  editable?: boolean
  onRemoveRequest?: (index: number) => void
  selectedIndex?: number
  onSelect?: (index: number) => void
}

function ImageUploadField({ value, onChange, multiple = false, maxCount, previewSize = 96, accept = 'image/*', editable = true, onRemoveRequest, selectedIndex, onSelect }: ImageUploadFieldProps) {
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
        <FlexBox key={url} style={{ position: 'relative', width: previewSize, height: previewSize }} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
          <button type="button" aria-label="이미지 크게 보기" onClick={() => setPreviewUrl(url)} style={{ width: previewSize, height: previewSize, padding: 0, border: 0, borderRadius: 12, background: 'transparent', cursor: 'zoom-in', overflow: 'hidden', position: 'relative', outline: onSelect && selectedIndex === index ? '2px solid var(--semantic-primary-normal)' : undefined, outlineOffset: -2 }}>
            <Thumbnail src={url} alt="업로드한 이미지 미리보기" ratio="1:1" width={previewSize} border radius />
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.48)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: hoveredIndex === index ? 1 : 0, transition: 'opacity .16s ease' }}>미리보기</span>
          </button>
          {onSelect && <button
            type="button"
            className="app-image-thumbnail-control"
            aria-label={`이미지 ${index + 1}${selectedIndex === index ? ': 현재 썸네일' : '을 썸네일로 설정'}`}
            aria-pressed={selectedIndex === index}
            disabled={!editable}
            onClick={() => onSelect(index)}
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              zIndex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 36,
              height: 36,
              padding: 4,
              border: 0,
              borderRadius: 999,
              background: 'transparent',
              cursor: editable ? 'pointer' : 'default',
            }}
          >
            <span
              className="app-image-thumbnail-indicator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: selectedIndex === index ? 'auto' : 24,
                height: selectedIndex === index ? 28 : 24,
                padding: selectedIndex === index ? '0 9px' : 0,
                borderRadius: 999,
                background: selectedIndex === index ? 'var(--semantic-primary-normal)' : '#fff',
                color: selectedIndex === index ? '#fff' : 'var(--semantic-label-normal)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              {selectedIndex === index && <Typography variant="caption2" weight="bold">썸네일</Typography>}
            </span>
          </button>}
          {editable && <IconButton
            variant="normal"
            size={16}
            aria-label="이미지 삭제"
            onClick={() => onRemoveRequest ? onRemoveRequest(index) : removeAt(index)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              width: 28,
              height: 28,
              padding: 6,
              background: '#fff',
              color: '#171717',
              border: '1px solid var(--semantic-line-normal-normal)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.16)',
            }}
          >
            <IconClose width={16} height={16} />
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

      <ImagePreviewModal imageUrl={previewUrl} alt="업로드한 이미지 원본 미리보기" onClose={() => setPreviewUrl(null)} />
    </FlexBox>
  )
}

export default ImageUploadField
