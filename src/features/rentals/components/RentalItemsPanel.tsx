import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, FlexBox, IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger, Typography, useToast } from '@wanteddev/wds'
import { IconChevronDown, IconChevronDownSmall, IconMoreVertical } from '@wanteddev/wds-icon'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import ConfirmModal from '../../../components/common/ConfirmModal'
import { useRentals } from '../store'
import StatusBadge, { type BadgeTone } from '../../../components/common/StatusBadge'
import { RENTAL_RETURN_POLICIES, type RentalItem, type RentalReturnPolicy } from '../types'

function FilterHeader({ label, options, value, onChange, ariaLabel }: { label: string; options: string[]; value: string[]; onChange: (value: string[]) => void; ariaLabel: string }) {
  return <Menu value={value} onValueChange={(nextValue) => { if (!Array.isArray(nextValue)) return; if (nextValue.length === 0) { onChange(['all']); return }; if (nextValue.includes('all')) { onChange(value.includes('all') ? nextValue.filter((item) => item !== 'all') : ['all']); return }; onChange(nextValue) }}><FlexBox alignItems="center" style={{ gap: 4 }}><span>{label}</span><MenuTrigger><IconButton variant="normal" size="small" aria-label={ariaLabel} style={{ width: 12, height: 12 }}><IconChevronDown width={6} height={6} /></IconButton></MenuTrigger></FlexBox><MenuContent position="bottom-start" offset={4}><MenuList><MenuItem variant="checkbox" value="all">전체</MenuItem>{options.map((option) => <MenuItem key={option} variant="checkbox" value={option}>{option}</MenuItem>)}</MenuList></MenuContent></Menu>
}

const policyTone: Record<RentalReturnPolicy, BadgeTone> = {
  '당일 반납': 'negative',
  '익일 반납': 'cautionary',
  '3일 후 반납': 'info',
  '7일 후 반납': 'positive',
}

function RentalItemsPanel() {
  const navigate = useNavigate()
  const { items, itemTypes, records, deleteItem, updateReturnPolicies } = useRentals()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState<RentalItem | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openPolicyId, setOpenPolicyId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [categoryFilters, setCategoryFilters] = useState<string[]>(['all'])
  const [itemKindFilters, setItemKindFilters] = useState<string[]>(['all'])
  const [policyFilters, setPolicyFilters] = useState<string[]>(['all'])

  const categories = [...new Set(items.map((item) => item.category))]
  const filteredItems = items.filter((item) =>
    (categoryFilters.includes('all') || categoryFilters.includes(item.category)) &&
    (itemKindFilters.includes('all') || itemKindFilters.includes(item.itemKind)) &&
    (policyFilters.includes('all') || policyFilters.includes(item.returnPolicy)),
  )

  const updatePolicy = (ids: string[], policy: RentalReturnPolicy) => {
    updateReturnPolicies(ids, policy)
    setSelectedIds([])
    toast({ content: `${ids.length}개 물품의 반납 정책을 ${policy}(으)로 변경했어요.`, variant: 'positive' })
  }

  const columns: DataTableColumn<RentalItem>[] = [
    { key: 'select', header: <Checkbox checked={filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id))} onCheckedChange={(checked) => setSelectedIds(checked ? [...new Set([...selectedIds, ...filteredItems.map((item) => item.id)])] : selectedIds.filter((id) => !filteredItems.some((item) => item.id === id)))} />, width: 48, align: 'center', render: (row) => <Checkbox checked={selectedIds.includes(row.id)} onCheckedChange={(checked) => setSelectedIds((prev) => checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} /> },
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
    { key: 'category', header: <FilterHeader label="카테고리" options={categories} value={categoryFilters} onChange={setCategoryFilters} ariaLabel="카테고리 필터" />, width: 160, render: (row) => row.category },
    {
      key: 'itemKind',
      header: <FilterHeader label="물품 구분" options={['대여품', '소모품']} value={itemKindFilters} onChange={setItemKindFilters} ariaLabel="물품 구분 필터" />,
      width: 110,
      render: (row) => <StatusBadge label={row.itemKind} tone={row.itemKind === '대여품' ? 'info' : 'cautionary'} />,
    },
    {
      key: 'quantity',
      header: '수량',
      width: 180,
      render: (row) => (
        <Typography variant="body2">
          {row.totalQuantity}
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
      key: 'returnPolicy',
      header: <FilterHeader label="반납 정책" options={RENTAL_RETURN_POLICIES} value={policyFilters} onChange={setPolicyFilters} ariaLabel="반납 정책 필터" />,
      width: 150,
      render: (row) => <Menu open={openPolicyId === row.id} onOpenChange={(open) => setOpenPolicyId(open ? row.id : null)}><MenuTrigger><span className="app-hoverable" style={{ display: 'inline-flex', cursor: 'pointer', borderRadius: 8 }}><StatusBadge label={row.returnPolicy} tone={policyTone[row.returnPolicy]} trailingContent={<IconChevronDownSmall width={18} height={18} />} /></span></MenuTrigger><MenuContent position="bottom-start" offset={8}><MenuList>{RENTAL_RETURN_POLICIES.map((policy) => <MenuItem key={policy} value={policy} onClick={() => { updatePolicy([row.id], policy); setOpenPolicyId(null) }}><StatusBadge label={policy} tone={policyTone[policy]} /></MenuItem>)}</MenuList></MenuContent></Menu>,
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

      <FlexBox style={{ position: 'relative', width: '100%', minWidth: 0 }}>
        {selectedIds.length > 0 && <FlexBox alignItems="center" style={{ position: 'absolute', zIndex: 2, bottom: 'calc(100% + 12px)', height: 48, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 12, background: 'var(--semantic-background-elevated-normal)', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,.12)' }}><Typography variant="body2" weight="bold" style={{ padding: '0 16px', color: 'var(--semantic-primary-normal)' }}>{selectedIds.length}개 선택됨</Typography><Menu><MenuTrigger><Button variant="outlined" color="assistive" style={{ height: 48, border: 0, borderLeft: '1px solid var(--semantic-line-normal-normal)', borderRadius: 0 }}>반납 정책 변경</Button></MenuTrigger><MenuContent position="bottom-start" offset={8}><MenuList>{RENTAL_RETURN_POLICIES.map((policy) => <MenuItem key={policy} value={policy} onClick={() => updatePolicy(selectedIds, policy)}>{policy}</MenuItem>)}</MenuList></MenuContent></Menu></FlexBox>}
        <DataTable columns={columns} rows={filteredItems} rowKey={(row) => row.id} emptyMessage="등록된 물품이 없어요." style={{ width: '100%', minWidth: 0 }} />
      </FlexBox>

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
