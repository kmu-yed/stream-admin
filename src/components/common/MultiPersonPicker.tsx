import { Button, Checkbox, FlexBox, Typography } from '@wanteddev/wds'

export type PickerPerson = {
  id: string
  name: string
  detail: string
  disabled?: boolean
}

type MultiPersonPickerProps = {
  items: PickerPerson[]
  selectedItems: PickerPerson[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onClear: () => void
}

function MultiPersonPicker({ items, selectedItems, selectedIds, onToggle, onClear }: MultiPersonPickerProps) {
  return <>
    <FlexBox flexDirection="column" style={{ width: '100%', maxHeight: 220, overflowY: 'auto', border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 10 }}>
      {items.length === 0 ? <Typography variant="body2" color="semantic.label.alternative" style={{ padding: 16 }}>검색 결과가 없어요.</Typography> : items.map((person) => {
        const selected = selectedIds.includes(person.id)
        return <div
          key={person.id}
          role="button"
          tabIndex={person.disabled ? -1 : 0}
          aria-disabled={person.disabled}
          onClick={() => { if (!person.disabled) onToggle(person.id) }}
          onKeyDown={(event) => { if (!person.disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onToggle(person.id) } }}
          aria-pressed={selected}
          style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', border: 0, borderBottom: '1px solid var(--semantic-line-normal-normal)', background: selected ? 'var(--semantic-primary-light)' : 'transparent', color: person.disabled ? 'var(--semantic-label-assistive)' : 'var(--semantic-label-normal)', textAlign: 'left', cursor: person.disabled ? 'not-allowed' : 'pointer', font: 'inherit' }}
        >
          <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}><Checkbox checked={selected} disabled={person.disabled} onCheckedChange={() => onToggle(person.id)} /></span>
          <span style={{ flex: 1, minWidth: 0 }}><strong>{person.name}</strong><span style={{ marginLeft: 8, fontSize: 13 }}>{person.detail}</span></span>
          {person.disabled && <span style={{ fontSize: 13 }}>등록됨</span>}
        </div>
      })}
    </FlexBox>
    {selectedItems.length > 0 && <FlexBox justifyContent="space-between" alignItems="center" style={{ gap: 12, padding: '14px 16px', border: '1px solid var(--semantic-primary-normal)', borderRadius: 10, background: 'var(--semantic-primary-light)' }}>
      <FlexBox flexDirection="column" style={{ gap: 3, minWidth: 0 }}>
        <Typography variant="label2" color="semantic.primary.normal">{selectedItems.length}명 선택됨</Typography>
        <Typography variant="body2" style={{ overflowWrap: 'anywhere' }}>{selectedItems.map((person) => person.name).join(', ')}</Typography>
      </FlexBox>
      <Button variant="outlined" color="assistive" size="small" onClick={onClear} style={{ flexShrink: 0 }}>선택 해제</Button>
    </FlexBox>}
  </>
}

export default MultiPersonPicker
