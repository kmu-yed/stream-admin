import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger, Typography } from '@wanteddev/wds'
import { IconMoreVertical } from '@wanteddev/wds-icon'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import ConfirmModal from '../../../components/common/ConfirmModal'
import { useRentals } from '../store'
import StatusBadge from '../../../components/common/StatusBadge'
import { getAvailableQuantity, type RentalItem } from '../types'

function RentalItemsPanel() {
  const navigate = useNavigate()
  const { items, itemTypes, records, deleteItem } = useRentals()
  const [deleteTarget, setDeleteTarget] = useState<RentalItem | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const columns: DataTableColumn<RentalItem>[] = [
    {
      key: 'icon',
      header: '아이콘',
      width: 76,
      align: 'center',
      render: (row) => {
        const icon = itemTypes.find((item) => item.category === row.category && item.name === row.name)?.icon
        const isPngIcon = icon?.endsWith('.png')
        if (icon && isPngIcon) return <img src={icon} alt={`${row.name} 아이콘`} style={{ width: 42, height: 42, objectFit: 'contain' }} />
        return icon ? (
          <span style={{ display: 'inline-flex', width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'var(--semantic-background-normal-alternative, #f7f7f8)' }}>
            <img src={icon} alt={`${row.name} 아이콘`} style={{ maxWidth: 28, maxHeight: 28, objectFit: 'contain' }} />
          </span>
        ) : null
      },
    },
    { key: 'name', header: '이름', render: (row) => row.name },
    { key: 'category', header: '카테고리', width: 160, render: (row) => row.category },
    {
      key: 'itemKind',
      header: '물품 구분',
      width: 110,
      render: (row) => <StatusBadge label={row.itemKind} tone={row.itemKind === '대여품' ? 'info' : 'cautionary'} />,
    },
    {
      key: 'quantity',
      header: '수량 (대여가능/전체)',
      width: 180,
      render: (row) => (
        <Typography variant="body2">
          {getAvailableQuantity(row, records)} / {row.totalQuantity}
        </Typography>
      ),
    },
    {
      key: 'totalRentalCount',
      header: '누적 대여 수',
      width: 120,
      render: (row) => records.filter((record) => record.itemId === row.id).length,
    },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) => (
        <Menu open={openMenuId === row.id} onOpenChange={(open) => setOpenMenuId(open ? row.id : null)}>
          <MenuTrigger>
            <IconButton variant="normal" size="small" aria-label={`${row.name} 더보기`}>
              <IconMoreVertical width={20} height={20} />
            </IconButton>
          </MenuTrigger>
          <MenuContent position="bottom-end" offset={4}>
            <MenuList>
              <MenuItem value="edit" onClick={() => { navigate(`/rentals/items/${row.id}/edit`); setOpenMenuId(null) }}>
                수정
              </MenuItem>
              <MenuItem value="delete" onClick={() => { setDeleteTarget(row); setOpenMenuId(null) }} style={{ color: 'var(--semantic-status-negative)' }}>
                삭제
              </MenuItem>
            </MenuList>
          </MenuContent>
        </Menu>
      ),
    },
  ]

  return (
    <>
      <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <Button variant="solid" color="primary" size="medium" onClick={() => navigate('/rentals/items/new')}>
          + 물품 등록
        </Button>
      </FlexBox>

      <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="등록된 물품이 없어요." />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="물품을 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.name}" 물품을 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteItem(deleteTarget.id)
        }}
      />
    </>
  )
}

export default RentalItemsPanel
