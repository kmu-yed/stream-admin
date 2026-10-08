import { IconClose, IconTrash } from '@wanteddev/wds-icon'
import {
  FlexBox,
  IconButton,
  Option,
  Button,
  Select,
  Switch,
  TextButton,
  TextField,
  TextFieldContent,
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
    onChange([...value, { id: makeId(), label: '', required: true, type: 'radio', options: [''], maxLength: 200 }])
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

  const addOtherOption = (fieldId: string) => {
    updateField(fieldId, { allowOther: true })
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
            background: 'var(--semantic-background-normal-normal)',
          }}
        >
          <FlexBox style={{ paddingLeft: 28 }}>
            <Select
              value={field.type}
              onChange={(v) => updateField(field.id, { type: v as ApplicationFieldType })}
              style={{ width: 200 }}
            >
              {(Object.keys(typeLabels) as ApplicationFieldType[]).map((type) => (
                <Option key={type} value={type}>
                  {typeLabels[type]}
                </Option>
              ))}
            </Select>
          </FlexBox>

          <FlexBox alignItems="flex-start" style={{ gap: 8 }}>
            <Typography variant="label2" color="semantic.label.alternative" style={{ width: 20, flexShrink: 0, paddingBottom: 12 }}>
              {index + 1}
            </Typography>
            <FlexBox flexDirection="column" style={{ flex: 1, gap: 6, padding: 12, background: 'var(--semantic-background-normal-normal)' }}>
              <Typography variant="label2" color="semantic.label.alternative">질문</Typography>
              <FlexBox alignItems="center" style={{ gap: 8 }}>
                <TextField
                  placeholder="질문을 입력하세요"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  leadingContent={field.required ? <TextFieldContent variant="text" color="semantic.status.negative">*</TextFieldContent> : undefined}
                  style={{ flex: 1 }}
                />
                <IconButton variant="normal" size="small" aria-label={`질문 ${index + 1} 삭제`} onClick={() => removeField(field.id)}>
                  <IconTrash width={16} height={16} />
                </IconButton>
              </FlexBox>
            </FlexBox>
          </FlexBox>

          {(field.type === 'radio' || field.type === 'checkbox') && (
            <FlexBox flexDirection="column" style={{ gap: 8, padding: '12px 12px 12px 40px', borderLeft: '3px solid var(--semantic-line-normal-normal)' }}>
              <Typography variant="label2" color="semantic.label.alternative">선택지</Typography>
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
                    aria-label={`선택지 ${optionIndex + 1} 삭제`}
                    onClick={() => removeOption(field.id, optionIndex)}
                  >
                    <IconClose width={16} height={16} />
                  </IconButton>
                </FlexBox>
              ))}
              {field.allowOther && (
                <FlexBox alignItems="center" style={{ gap: 8 }}>
                  <TextField disabled value="기타 내용을 입력해주세요" style={{ flex: 1 }} />
                  <IconButton variant="normal" size="small" aria-label="기타 선택지 삭제" onClick={() => updateField(field.id, { allowOther: false })}>
                    <IconClose width={16} height={16} />
                  </IconButton>
                </FlexBox>
              )}
              <FlexBox alignItems="center" style={{ gap: 8 }}>
                <TextButton size="small" onClick={() => addOption(field.id)}>
                  + 선택지 추가
                </TextButton>
                {!field.allowOther && <><Typography variant="caption1" color="semantic.label.alternative">또는</Typography><TextButton size="small" onClick={() => addOtherOption(field.id)}>+ 기타</TextButton></>}
              </FlexBox>
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

          <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 8, marginTop: 4 }}>
            <Typography variant="label2" color="semantic.label.alternative">
              필수 응답
            </Typography>
            <Switch
              checked={field.required}
              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              size="small"
            />
          </FlexBox>
        </FlexBox>
      ))}
      <FlexBox>
        <Button variant="outlined" color="primary" size="small" onClick={addField}>
          + 신청 항목 추가
        </Button>
      </FlexBox>
    </FlexBox>
  )
}

export default ApplicationFormBuilder
