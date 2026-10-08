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
  const handleChange = (nextValue?: string | string[]) => {
    if (!Array.isArray(nextValue)) return
    if (nextValue.length === 0) return onChange(['all'])
    if (nextValue.includes('all')) return onChange(value.includes('all') ? nextValue.filter((item) => item !== 'all') : ['all'])
    onChange(nextValue)
  }

  return <Menu value={value} onValueChange={handleChange}>
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
