import { useState } from 'react'
import { FlexBox, SegmentedControl, SegmentedControlItem, Typography } from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import SearchField from '../../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../../components/common/StatusBadge'
import { useRentals } from '../store'
import { getRentalRecordStatus, type RentalRecord, type RentalRecordStatus } from '../types'

type Filter = 'all' | RentalRecordStatus

const statusTone: Record<RentalRecordStatus, BadgeTone> = {
  대여중: 'info',
  연체: 'negative',
  반납완료: 'neutral',
}

function RentalRecordsPanel() {
  const { records } = useRentals()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = records.filter((r) => {
    if (filter !== 'all' && getRentalRecordStatus(r) !== filter) return false
    const keyword = search.trim()
    if (!keyword) return true
    return r.borrowerName.includes(keyword) || r.borrowerStudentId.includes(keyword)
  })

  const columns: DataTableColumn<RentalRecord>[] = [
    { key: 'itemName', header: '물품명', render: (row) => row.itemName },
    {
      key: 'borrower',
      header: '대여자',
      render: (row) => `${row.borrowerName} (${row.borrowerStudentId})`,
    },
    { key: 'borrowedAt', header: '대여일', width: 120, render: (row) => row.borrowedAt },
    { key: 'dueDate', header: '반납예정일', width: 120, render: (row) => row.dueDate },
    { key: 'returnedAt', header: '반납일', width: 120, render: (row) => row.returnedAt ?? '-' },
    {
      key: 'status',
      header: '상태',
      width: 100,
      render: (row) => {
        const status = getRentalRecordStatus(row)
        return <StatusBadge label={status} tone={statusTone[status]} />
      },
    },
  ]

  return (
    <>
      <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
        <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as Filter)} size="small" style={{ width: 320 }}>
          <SegmentedControlItem value="all">전체</SegmentedControlItem>
          <SegmentedControlItem value="대여중">대여중</SegmentedControlItem>
          <SegmentedControlItem value="연체">연체</SegmentedControlItem>
          <SegmentedControlItem value="반납완료">반납완료</SegmentedControlItem>
        </SegmentedControl>
        <SearchField value={search} onChange={setSearch} placeholder="대여자 이름 또는 학번 검색" />
      </FlexBox>
      <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <Typography variant="caption1" color="semantic.label.alternative">
          연체 처리와 연체 알림은 자동으로 이루어져요.
        </Typography>
      </FlexBox>

      <DataTable columns={columns} rows={filtered} rowKey={(row) => row.id} emptyMessage="대여 기록이 없어요." />
    </>
  )
}

export default RentalRecordsPanel
