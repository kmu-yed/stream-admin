import { IconTrash } from '@wanteddev/wds-icon'
import { FlexBox, IconButton, TextButton, TextField, Typography } from '@wanteddev/wds'
import type { EventInfoLabel } from '../types'

function makeId() {
  return `lbl_${Math.random().toString(36).slice(2, 9)}`
}

type InfoLabelsEditorProps = {
  value: EventInfoLabel[]
  onChange: (labels: EventInfoLabel[]) => void
}

function InfoLabelsEditor({ value, onChange }: InfoLabelsEditorProps) {
  const updateLabel = (id: string, patch: Partial<EventInfoLabel>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeLabel = (id: string) => {
    onChange(value.filter((item) => item.id !== id))
  }

  const addLabel = () => {
    onChange([...value, { id: makeId(), label: '', value: '' }])
  }

  return (
    <FlexBox flexDirection="column" style={{ gap: 8 }}>
      {value.map((item) => (
        <FlexBox key={item.id} alignItems="center" style={{ gap: 8 }}>
          <TextField
            placeholder="라벨명"
            value={item.label}
            disabled={item.locked}
            onChange={(e) => updateLabel(item.id, { label: e.target.value })}
            style={{ width: 140, flexShrink: 0 }}
          />
          <TextField
            placeholder="내용을 입력하세요"
            value={item.value}
            onChange={(e) => updateLabel(item.id, { value: e.target.value })}
            style={{ flex: 1 }}
          />
          {item.locked ? (
            <FlexBox style={{ width: 32, flexShrink: 0 }} />
          ) : (
            <IconButton
              variant="normal"
              size="small"
              onClick={() => removeLabel(item.id)}
              style={{ flexShrink: 0 }}
            >
              <IconTrash />
            </IconButton>
          )}
        </FlexBox>
      ))}
      <FlexBox>
        <TextButton size="small" onClick={addLabel}>
          + 라벨 추가
        </TextButton>
      </FlexBox>
      <Typography variant="caption1" color="semantic.label.alternative">
        &quot;일시&quot;, &quot;장소&quot;는 필수 라벨이며 삭제할 수 없어요.
      </Typography>
    </FlexBox>
  )
}

export default InfoLabelsEditor
