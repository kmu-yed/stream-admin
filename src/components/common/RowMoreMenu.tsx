import { IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger } from '@wanteddev/wds'
import { IconMoreVertical } from '@wanteddev/wds-icon'

type RowMoreMenuProps = {
  label: string
  onEdit?: () => void
  onDelete?: () => void
  deleteLabel?: string
}

function RowMoreMenu({ label, onEdit, onDelete, deleteLabel = '삭제' }: RowMoreMenuProps) {
  return (
    <Menu>
      <MenuTrigger>
        <IconButton variant="normal" size="small" aria-label={`${label} 더보기`}>
          <IconMoreVertical width={20} height={20} />
        </IconButton>
      </MenuTrigger>
      <MenuContent position="bottom-end" offset={4} style={{ zIndex: 200 }}>
        <MenuList>
          {onEdit && <MenuItem value="edit" onClick={onEdit}>수정</MenuItem>}
          {onDelete && <MenuItem value="delete" onClick={onDelete} style={{ color: 'var(--semantic-status-negative)' }}>{deleteLabel}</MenuItem>}
        </MenuList>
      </MenuContent>
    </Menu>
  )
}

export default RowMoreMenu
