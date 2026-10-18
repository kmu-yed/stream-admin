import { FlexBox, IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger } from '@wanteddev/wds'
import { IconChevronDown } from '@wanteddev/wds-icon'

type TableCheckboxFilterProps = {
  label: string
  ariaLabel: string
  allLabel?: string
  options: readonly (string | { value: string; label: string })[]
  value: string[]
  onChange: (value: string[]) => void
}

function TableCheckboxFilter({ label, ariaLabel, allLabel = '전체', options, value, onChange }: TableCheckboxFilterProps) {
  const optionValues = options.map((option) => typeof option === 'string' ? option : option.value)
  const menuValue = value.includes('all') ? ['all', ...optionValues] : value

  const handleChange = (nextValue?: string | string[]) => {
    if (!Array.isArray(nextValue)) return
    const selectedOptions = nextValue.filter((item) => item !== 'all')

    // ‘전체’가 선택되면 모든 개별 체크박스도 선택된 상태로 표시한다.
    if (nextValue.includes('all') && !value.includes('all')) return onChange(['all'])
    if (nextValue.includes('all')) return onChange(selectedOptions)
    // 전체 선택 상태에서 ‘전체’를 다시 누르면 모든 선택을 해제한다.
    if (value.includes('all') && selectedOptions.length === optionValues.length) return onChange([])
    if (selectedOptions.length === optionValues.length) return onChange(['all'])
    onChange(selectedOptions)
  }

  return <Menu value={menuValue} onValueChange={handleChange}>
    <FlexBox alignItems="center" style={{ gap: 4 }}>
      <span>{label}</span>
      <MenuTrigger>
        <IconButton variant="normal" size="small" aria-label={ariaLabel} style={{ width: 12, height: 12 }}>
          <IconChevronDown width={6} height={6} />
        </IconButton>
      </MenuTrigger>
    </FlexBox>
    <MenuContent position="bottom-start" offset={4}>
      <MenuList>
        <MenuItem variant="checkbox" value="all">{allLabel}</MenuItem>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return <MenuItem key={value} variant="checkbox" value={value}>{optionLabel}</MenuItem>
        })}
      </MenuList>
    </MenuContent>
  </Menu>
}

export default TableCheckboxFilter
