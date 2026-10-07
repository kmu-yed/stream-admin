import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import { IconCalendar, IconClock } from '@wanteddev/wds-icon'
import DataTable, { type DataTableColumn } from '../../../components/common/DataTable'
import StatusBadge, { type BadgeTone } from '../../../components/common/StatusBadge'
import ConfirmModal from '../../../components/common/ConfirmModal'
import RowMoreMenu from '../../../components/common/RowMoreMenu'
import { useLockers } from '../store'
import {
  formatSemesterLabel,
  getSemesterStatus,
  type LockerSemester,
  type SemesterStatus,
} from '../types'

const statusTone: Record<SemesterStatus, BadgeTone> = {
  진행중: 'info',
  예정: 'neutral',
  종료: 'negative',
}

function pickCurrentSemester(semesters: LockerSemester[]): LockerSemester | undefined {
  const ongoing = semesters.find((s) => getSemesterStatus(s) === '진행중')
  if (ongoing) return ongoing
  const upcoming = semesters
    .filter((s) => getSemesterStatus(s) === '예정')
    .sort((a, b) => a.applyStartDate.localeCompare(b.applyStartDate))[0]
  if (upcoming) return upcoming
  return [...semesters].sort((a, b) => b.applyEndDate.localeCompare(a.applyEndDate))[0]
}

function LockerSchedulePanel() {
  const navigate = useNavigate()
  const { semesters, deleteSemester } = useLockers()
  const [deleteTarget, setDeleteTarget] = useState<LockerSemester | null>(null)

  const currentSemester = useMemo(() => pickCurrentSemester(semesters), [semesters])

  const sortedSemesters = useMemo(
    () => [...semesters].sort((a, b) => b.applyStartDate.localeCompare(a.applyStartDate)),
    [semesters],
  )

  const columns: DataTableColumn<LockerSemester>[] = [
    { key: 'label', header: '학기', width: 140, render: (row) => formatSemesterLabel(row) },
    { key: 'apply', header: '신청 기간', render: (row) => `${row.applyStartDate} ~ ${row.applyEndDate}` },
    { key: 'use', header: '사용 가능 기간', render: (row) => `${row.useStartDate} ~ ${row.useEndDate}` },
    {
      key: 'status',
      header: '상태',
      width: 100,
      render: (row) => {
        const status = getSemesterStatus(row)
        return <StatusBadge label={status} tone={statusTone[status]} />
      },
    },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) => {
        const status = getSemesterStatus(row)
        const canEdit = status === '예정' || status === '진행중'
        return <RowMoreMenu label={`${formatSemesterLabel(row)} 신청 일정`} onEdit={canEdit ? () => navigate(`/lockers/schedule/${row.id}/edit`) : undefined} onDelete={() => setDeleteTarget(row)} />
      },
    },
  ]

  return (
    <FlexBox flexDirection="column" style={{ gap: 24 }}>
      <FlexBox justifyContent="space-between" alignItems="flex-start">
        <FlexBox
          flexDirection="column"
          style={{
            gap: 4,
            padding: 20,
            borderRadius: 12,
            background: 'rgba(var(--semantic-primary-normal-rgb), 0.06)',
            border: '1px solid rgba(var(--semantic-primary-normal-rgb), 0.16)',
            maxWidth: 420,
            flex: 1,
          }}
        >
          <Typography variant="label2" color="semantic.label.alternative">
            현재 진행 차례
          </Typography>
          {currentSemester ? (
            <>
              <Typography variant="title3" weight="bold" color="semantic.primary.normal">
                {formatSemesterLabel(currentSemester)} · {getSemesterStatus(currentSemester)}
              </Typography>
              <FlexBox alignItems="center" style={{ gap: 6, marginTop: 4 }}>
                <IconCalendar width={16} height={16} style={{ color: 'var(--semantic-label-alternative)' }} />
                <Typography variant="body2" color="semantic.label.alternative">
                  신청 {currentSemester.applyStartDate} ~ {currentSemester.applyEndDate}
                </Typography>
              </FlexBox>
              <FlexBox alignItems="center" style={{ gap: 6 }}>
                <IconClock width={16} height={16} style={{ color: 'var(--semantic-label-alternative)' }} />
                <Typography variant="body2" color="semantic.label.alternative">
                  사용 {currentSemester.useStartDate} ~ {currentSemester.useEndDate}
                </Typography>
              </FlexBox>
            </>
          ) : (
            <Typography variant="body2" color="semantic.label.alternative">
              등록된 신청 일정이 없어요. 새 학기를 등록해주세요.
            </Typography>
          )}
        </FlexBox>

        <Button variant="solid" color="primary" onClick={() => navigate('/lockers/schedule/new')}>
          + 새 학기 신청일정 등록
        </Button>
      </FlexBox>

      <FlexBox flexDirection="column" style={{ gap: 12 }}>
        <Typography variant="label1" weight="bold">
          신청 일정 변경 내역
        </Typography>
        <DataTable
          columns={columns}
          rows={sortedSemesters}
          rowKey={(row) => row.id}
          emptyMessage="등록된 학기가 없어요."
        />
      </FlexBox>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="신청 일정을 삭제할까요?"
        description={deleteTarget ? `${formatSemesterLabel(deleteTarget)} 신청 일정을 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteSemester(deleteTarget.id)
        }}
      />
    </FlexBox>
  )
}

export default LockerSchedulePanel
