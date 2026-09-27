import { useState } from 'react'
import {
  FlexBox,
  SegmentedControl,
  SegmentedControlItem,
  Typography,
  useToast,
} from '@wanteddev/wds'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import SearchField from '../../../components/common/SearchField'
import StatusBadge from '../../../components/common/StatusBadge'
import ConfirmModal from '../../../components/common/ConfirmModal'
import RowMoreMenu from '../../../components/common/RowMoreMenu'
import { useLockers } from '../store'
import { type LockerApplication } from '../types'

type StatusFilter = 'all' | '신청완료' | '취소'

function LockerApplicantsPanel() {
  const { lockers, applications, cancelApplication } = useLockers()
  const toast = useToast()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [cancelTarget, setCancelTarget] = useState<LockerApplication | null>(null)
  const [search, setSearch] = useState('')

  const lockerNumber = (lockerId?: string) => lockers.find((locker) => locker.id === lockerId)?.zone

  const filtered = applications.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false
    const keyword = search.trim()
    if (!keyword) return true
    return a.name.includes(keyword) || a.studentId.includes(keyword)
  })

  const columns: DataTableColumn<LockerApplication>[] = [
    { key: 'name', header: '이름', width: 100, render: (row) => row.name },
    { key: 'studentId', header: '학번', width: 140, render: (row) => row.studentId },
    { key: 'grade', header: '학년', width: 80, render: (row) => `${row.grade}학년` },
    { key: 'appliedAt', header: '신청일시', width: 140, render: (row) => row.appliedAt },
    {
      key: 'locker',
      header: '배정 사물함',
      width: 120,
      render: (row) =>
        row.lockerId ? (
          <Typography variant="body2" weight="medium" color="semantic.primary.normal">
            {lockerNumber(row.lockerId)}
          </Typography>
        ) : (
          <Typography variant="body2" color="semantic.label.alternative">
            -
          </Typography>
        ),
    },
    {
      key: 'status',
      header: '상태',
      width: 100,
      render: (row) => <StatusBadge label={row.status} tone={row.status === '취소' ? 'negative' : 'positive'} />,
    },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) =>
        row.status === '신청완료' ? (
          <RowMoreMenu label={`${row.name} 신청`} onDelete={() => setCancelTarget(row)} deleteLabel="취소 처리" />
        ) : (
          <Typography variant="label2" color="semantic.label.alternative">
            -
          </Typography>
        ),
    },
  ]

  return (
    <FlexBox flexDirection="column" style={{ gap: 16 }}>
      <Typography variant="body2" color="semantic.label.alternative">
        총 {applications.length}명 신청 (신청완료 {applications.filter((a) => a.status === '신청완료').length}명 ·
        취소 {applications.filter((a) => a.status === '취소').length}명)
      </Typography>

      <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 4, gap: 12 }}>
        <SegmentedControl
          value={filter}
          onValueChange={(v) => setFilter(v as StatusFilter)}
          size="small"
          style={{ width: 300 }}
        >
          <SegmentedControlItem value="all">전체</SegmentedControlItem>
          <SegmentedControlItem value="신청완료">신청완료</SegmentedControlItem>
          <SegmentedControlItem value="취소">취소</SegmentedControlItem>
        </SegmentedControl>
        <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="신청자가 없어요."
        style={{ width: '100%', tableLayout: 'fixed' }}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="신청을 취소 처리할까요?"
        description={
          cancelTarget
            ? `${cancelTarget.name}(${cancelTarget.studentId})님의 신청을 취소하고 배정된 사물함(${lockerNumber(cancelTarget.lockerId) ?? '-'})을 반납 처리해요.`
            : undefined
        }
        confirmLabel="취소 처리"
        tone="negative"
        onConfirm={() => {
          if (cancelTarget) {
            cancelApplication(cancelTarget.id)
            toast({ content: '신청이 취소 처리되었어요.', variant: 'normal' })
          }
        }}
      />
    </FlexBox>
  )
}

export default LockerApplicantsPanel
