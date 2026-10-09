import { useEffect, useRef, useState } from 'react'
import { FlexBox, IconButton, TextField, TextFieldContent } from '@wanteddev/wds'
import { IconSearch } from '@wanteddev/wds-icon'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  width?: number | string
  height?: number | string
}

function SearchField({ value, onChange, placeholder, width = 260, height = 40 }: SearchFieldProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus()
  }, [mobileOpen])

  return (
    <FlexBox
      className={`app-search-field${mobileOpen ? ' app-search-open' : ''}${value ? ' app-search-has-value' : ''}`}
      style={{ width }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMobileOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && mobileOpen) {
          inputRef.current?.blur()
          setMobileOpen(false)
        }
      }}
    >
      <IconButton
        className="app-search-trigger"
        variant="outlined"
        size="medium"
        aria-label={`${placeholder} 열기`}
        onClick={() => setMobileOpen(true)}
      >
        <IconSearch />
      </IconButton>
      <TextField
        ref={inputRef}
        className="app-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        width="100%"
        height={height}
        trailingContent={
          <TextFieldContent variant="icon" color="semantic.label.assistive">
            <IconSearch />
          </TextFieldContent>
        }
      />
    </FlexBox>
  )
}

export default SearchField
