import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Menu, MenuContent, MenuTrigger, SegmentedControl, SegmentedControlItem, Typography } from '@wanteddev/wds'
import { IconChevronDownSmall } from '@wanteddev/wds-icon'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import SearchField from '../../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../../components/common/StatusBadge'
import { useRentals } from '../store'
import { getRentalRecordStatus, RENTAL_RECORD_STATUSES, type RentalRecord, type RentalRecordStatus } from '../types'

type Filter = 'all' | RentalRecordStatus

const statusTone: Record<RentalRecordStatus, BadgeTone> = {
  '대여 승인대기': 'neutral',
  '반납 승인대기': 'neutral',
  수령대기: 'cautionary',
  반납대기: 'cautionary',
  대여중: 'info',
  반납완료: 'positive',
  대기취소: 'negative',
  대여불가: 'negative',
}

function overdueDays(dueDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate.replace(' ', 'T'))
  due.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - due.getTime()) / 86400000)
}

function RentalRecordsPanel() {
  const navigate = useNavigate()
  const { records, updateRentalRecordStatus } = useRentals()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [openStatusId, setOpenStatusId] = useState<string | null>(null)

  const filtered = records.filter((r) => {
    if (filter !== 'all' && getRentalRecordStatus(r) !== filter) return false
    const keyword = search.trim()
    if (!keyword) return true
    return r.borrowerName.includes(keyword) || r.borrowerStudentId.includes(keyword)
  })

  const columns: DataTableColumn<RentalRecord>[] = [
    { key: 'itemName', header: '물품명', width: 150, render: (row) => row.itemName },
    {
      key: 'borrower',
      header: '대여자',
      width: 180,
      render: (row) => `${row.borrowerName} (${row.borrowerStudentId})`,
    },
    { key: 'borrowedAt', header: '대여일', width: 160, render: (row) => row.borrowedAt },
    {
      key: 'returnedAt',
      header: '반납일',
      width: 160,
      render: (row) => {
        if (row.returnedAt) return row.returnedAt
        const days = overdueDays(row.dueDate)
        if (days > 0) {
          return <FlexBox flexDirection="column" style={{ gap: 2 }}>
            <Typography variant="body2" weight="medium" style={{ color: 'var(--semantic-status-negative)' }}>{row.dueDate}</Typography>
            <Typography variant="caption1" style={{ color: 'var(--semantic-status-negative)' }}>{days}일 연체</Typography>
          </FlexBox>
        }
        return <Typography variant="body2" color="semantic.label.alternative">{row.dueDate}</Typography>
      },
    },
    {
      key: 'status',
      header: '상태',
      width: 180,
      render: (row) => {
        const status = getRentalRecordStatus(row)
        return (
          <Menu open={openStatusId === row.id} onOpenChange={(open) => setOpenStatusId(open ? row.id : null)}>
            <MenuTrigger>
              <span className="app-hoverable" style={{ display: 'inline-flex', cursor: 'pointer', borderRadius: 8 }}>
                <StatusBadge label={status} tone={statusTone[status]} size="medium" trailingContent={<IconChevronDownSmall width={20} height={20} />} />
              </span>
            </MenuTrigger>
            <MenuContent
              position="bottom-end"
              offset={8}
              className="rental-status-menu-content"
              wrapperProps={{ style: { zIndex: 1000 } }}
            >
              <FlexBox flexDirection="column" style={{ gap: 14, padding: 16 }}>
                <FlexBox flexDirection="column" style={{ gap: 8 }}>
                  <Typography variant="label2" color="semantic.label.alternative">현재 상태</Typography>
                  <StatusBadge label={status} tone={statusTone[status]} size="medium" />
                </FlexBox>
                <div style={{ height: 1, background: '#d9dde3' }} />
                <div className="rental-status-menu-list">
                  {RENTAL_RECORD_STATUSES.map((option) => {
                    const tone = statusTone[option]
                    return <div key={option} className="rental-status-option" role="menuitem" tabIndex={0} onClick={() => { updateRentalRecordStatus(row.id, option); setOpenStatusId(null) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); updateRentalRecordStatus(row.id, option); setOpenStatusId(null) } }}><StatusBadge label={option} tone={tone} size="medium" /></div>
                  })}
                </div>
              </FlexBox>
            </MenuContent>
          </Menu>
        )
      },
    },
  ]

  return (
    <>
      <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
        <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as Filter)} size="small" style={{ width: 320 }}>
          <SegmentedControlItem value="all">전체</SegmentedControlItem>
          <SegmentedControlItem value="대여중">대여중</SegmentedControlItem>
          <SegmentedControlItem value="반납완료">반납완료</SegmentedControlItem>
        </SegmentedControl>
        <FlexBox style={{ gap: 12 }}>
          <SearchField value={search} onChange={setSearch} placeholder="대여자 이름 또는 학번 검색" height={40} />
          <Button variant="solid" color="primary" size="medium" onClick={() => navigate('/rentals/records/new')}>+ 대여 추가하기</Button>
        </FlexBox>
      </FlexBox>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="대여 기록이 없어요."
        style={{ width: '100%', tableLayout: 'fixed' }}
        className="rental-records-table"
      />
    </>
  )
}

export default RentalRecordsPanel
