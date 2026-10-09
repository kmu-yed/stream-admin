import { useState } from 'react'
import { Menu, MenuContent, MenuItem, MenuList, MenuTrigger } from '@wanteddev/wds'
import { IconChevronDownSmall } from '@wanteddev/wds-icon'
import StatusBadge, { type BadgeTone } from './StatusBadge'

export type StatusBadgeOption<T extends string> = {
  value: T
  label: string
  tone: BadgeTone
}

type StatusBadgeDropdownProps<T extends string> = {
  value: T
  options: readonly StatusBadgeOption<T>[]
  onChange: (value: T) => void
}

function StatusBadgeDropdown<T extends string>({ value, options, onChange }: StatusBadgeDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)
  if (!selected) return null

  return <Menu value={value} onValueChange={() => undefined} open={open} onOpenChange={setOpen}>
    <MenuTrigger>
      <span className="app-hoverable" style={{ display: 'inline-flex', cursor: 'pointer', borderRadius: 8 }}>
        <StatusBadge label={selected.label} tone={selected.tone} trailingContent={<IconChevronDownSmall width={18} height={18} />} />
      </span>
    </MenuTrigger>
    <MenuContent position="bottom-end" offset={8}>
      <MenuList>
        {options.map((option) => <MenuItem key={option.value} value={option.value} onClick={() => {
          if (option.value !== value) onChange(option.value)
          setOpen(false)
        }}><StatusBadge label={option.label} tone={option.tone} /></MenuItem>)}
      </MenuList>
    </MenuContent>
  </Menu>
}

export default StatusBadgeDropdown
