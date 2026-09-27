import { IconClose, IconImage } from '@wanteddev/wds-icon'
import { FlexBox, IconButton, Thumbnail, Typography } from '@wanteddev/wds'

type ImageUploadFieldProps = {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxCount?: number
  previewSize?: number
  accept?: string
}

function ImageUploadField({ value, onChange, multiple = false, maxCount, previewSize = 96, accept = 'image/*' }: ImageUploadFieldProps) {
  const canAddMore = maxCount === undefined || value.length < maxCount

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
        <FlexBox key={url} style={{ position: 'relative' }}>
          <Thumbnail src={url} alt="업로드한 이미지 미리보기" ratio="1:1" width={previewSize} border radius />
          <IconButton
            variant="normal"
            size="small"
            onClick={() => removeAt(index)}
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
          </IconButton>
        </FlexBox>
      ))}

      {canAddMore && (
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
    </FlexBox>
  )
}

export default ImageUploadField
