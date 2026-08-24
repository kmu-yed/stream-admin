import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import ConfirmModal from '../../../components/common/ConfirmModal'
import RowActionButton from '../../../components/common/RowActionButton'
import { useRentals } from '../store'
import { getAvailableQuantity, type RentalItem } from '../types'

function RentalItemsPanel() {
  const navigate = useNavigate()
  const { items, records, deleteItem } = useRentals()
  const [deleteTarget, setDeleteTarget] = useState<RentalItem | null>(null)

  const columns: DataTableColumn<RentalItem>[] = [
    { key: 'name', header: '이름', render: (row) => row.name },
    { key: 'category', header: '카테고리', width: 160, render: (row) => row.category },
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
      key: 'actions',
      header: '',
      width: 140,
      align: 'right',
      render: (row) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
          <RowActionButton onClick={() => navigate(`/rentals/items/${row.id}/edit`)}>수정</RowActionButton>
          <RowActionButton danger onClick={() => setDeleteTarget(row)}>
            삭제
          </RowActionButton>
        </FlexBox>
      ),
    },
  ]

  return (
    <>
      <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <Button variant="solid" color="primary" onClick={() => navigate('/rentals/items/new')}>
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
