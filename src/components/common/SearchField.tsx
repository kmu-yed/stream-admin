import { FlexBox, TextField, TextFieldContent } from '@wanteddev/wds'
import { IconSearch } from '@wanteddev/wds-icon'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  width?: number | string
  height?: number | string
}

function SearchField({ value, onChange, placeholder, width = 260, height = 40 }: SearchFieldProps) {
  return (
    <FlexBox className="app-search-field" style={{ width }}>
      <TextField
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
