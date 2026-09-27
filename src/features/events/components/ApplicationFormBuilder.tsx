import { IconTrash } from '@wanteddev/wds-icon'
import {
  FlexBox,
  IconButton,
  Option,
  Select,
  Switch,
  TextButton,
  TextField,
  Typography,
} from '@wanteddev/wds'
import type { ApplicationFieldType, ApplicationFormField } from '../types'

function makeId() {
  return `fld_${Math.random().toString(36).slice(2, 9)}`
}

const typeLabels: Record<ApplicationFieldType, string> = {
  radio: '라디오 (단일 선택)',
  checkbox: '체크박스 (다중 선택)',
  text: '텍스트 입력',
}

type ApplicationFormBuilderProps = {
  value: ApplicationFormField[]
  onChange: (fields: ApplicationFormField[]) => void
}

function ApplicationFormBuilder({ value, onChange }: ApplicationFormBuilderProps) {
  const updateField = (id: string, patch: Partial<ApplicationFormField>) => {
    onChange(value.map((field) => (field.id === id ? { ...field, ...patch } : field)))
  }

  const removeField = (id: string) => {
    onChange(value.filter((field) => field.id !== id))
  }

  const addField = () => {
    onChange([...value, { id: makeId(), label: '', required: true, type: 'text', options: [], maxLength: 200 }])
  }

  const updateOption = (fieldId: string, index: number, text: string) => {
    const field = value.find((item) => item.id === fieldId)
    if (!field) return
    const options = [...field.options]
    options[index] = text
    updateField(fieldId, { options })
  }

  const addOption = (fieldId: string) => {
    const field = value.find((item) => item.id === fieldId)
    if (!field) return
    updateField(fieldId, { options: [...field.options, ''] })
  }

  const removeOption = (fieldId: string, index: number) => {
    const field = value.find((item) => item.id === fieldId)
    if (!field) return
    updateField(fieldId, { options: field.options.filter((_, i) => i !== index) })
  }

  return (
    <FlexBox flexDirection="column" style={{ gap: 16 }}>
      {value.map((field, index) => (
        <FlexBox
          key={field.id}
          flexDirection="column"
          style={{
            gap: 12,
            padding: 16,
            border: '1px solid var(--semantic-line-normal-normal)',
            borderRadius: 12,
          }}
        >
          <FlexBox alignItems="center" style={{ gap: 8 }}>
            <Typography variant="label2" color="semantic.label.alternative" style={{ width: 20, flexShrink: 0 }}>
              {index + 1}
            </Typography>
            <TextField
              placeholder="질문 라벨"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              style={{ flex: 1 }}
            />
            <Select
              value={field.type}
              onChange={(v) => updateField(field.id, { type: v as ApplicationFieldType })}
              style={{ width: 200, flexShrink: 0 }}
            >
              {(Object.keys(typeLabels) as ApplicationFieldType[]).map((type) => (
                <Option key={type} value={type}>
                  {typeLabels[type]}
                </Option>
              ))}
            </Select>
            <IconButton variant="normal" size="small" onClick={() => removeField(field.id)}>
              <IconTrash />
            </IconButton>
          </FlexBox>

          <FlexBox alignItems="center" style={{ gap: 8 }}>
            <Switch
              checked={field.required}
              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              size="small"
            />
            <Typography variant="label2" color="semantic.label.alternative">
              필수 응답
            </Typography>
          </FlexBox>

          {(field.type === 'radio' || field.type === 'checkbox') && (
            <FlexBox flexDirection="column" style={{ gap: 6, paddingLeft: 28 }}>
              {field.options.map((option, optionIndex) => (
                <FlexBox key={optionIndex} alignItems="center" style={{ gap: 8 }}>
                  <TextField
                    placeholder={`선택지 ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <IconButton
                    variant="normal"
                    size="small"
                    onClick={() => removeOption(field.id, optionIndex)}
                  >
                    <IconTrash />
                  </IconButton>
                </FlexBox>
              ))}
              <FlexBox>
                <TextButton size="small" onClick={() => addOption(field.id)}>
                  + 선택지 추가
                </TextButton>
              </FlexBox>
              <FlexBox alignItems="center" style={{ gap: 8, marginTop: 4 }}>
                <Switch
                  checked={Boolean(field.allowOther)}
                  onCheckedChange={(checked) => updateField(field.id, { allowOther: checked })}
                  size="small"
                />
                <FlexBox flexDirection="column" style={{ gap: 2 }}>
                  <Typography variant="label2" color="semantic.label.normal">
                    기타 선택지 사용
                  </Typography>
                  <Typography variant="caption1" color="semantic.label.alternative">
                    신청자가 기타를 선택하면 단답식으로 내용을 입력할 수 있어요.
                  </Typography>
                </FlexBox>
              </FlexBox>
              {field.allowOther && (
                <FlexBox flexDirection="column" style={{ gap: 6, marginTop: 4 }}>
                  <Typography variant="caption1" color="semantic.label.alternative">
                    신청자 화면 미리보기
                  </Typography>
                  <FlexBox alignItems="center" style={{ gap: 8 }}>
                    <Typography variant="body2">□ 기타</Typography>
                    <TextField disabled placeholder="기타 내용을 입력해 주세요." style={{ flex: 1 }} />
                  </FlexBox>
                </FlexBox>
              )}
            </FlexBox>
          )}

          {field.type === 'text' && (
            <FlexBox alignItems="center" style={{ gap: 8, paddingLeft: 28 }}>
              <Typography variant="label2" color="semantic.label.alternative">
                최대 글자수
              </Typography>
              <TextField
                type="number"
                value={String(field.maxLength ?? '')}
                onChange={(e) =>
                  updateField(field.id, { maxLength: Number(e.target.value) || undefined })
                }
                style={{ width: 100 }}
              />
            </FlexBox>
          )}
        </FlexBox>
      ))}
      <FlexBox>
        <TextButton size="small" onClick={addField}>
          + 신청 항목 추가
        </TextButton>
      </FlexBox>
    </FlexBox>
  )
}

export default ApplicationFormBuilder
