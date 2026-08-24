import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  SegmentedControl,
  SegmentedControlItem,
  TextButton,
  Typography,
  useToast,
} from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useEvents } from './store'
import type { Applicant } from './types'

type StatusFilter = 'all' | '신청완료' | '취소'

function toCsv(rows: Applicant[], fieldLabels: Record<string, string>) {
  const fieldIds = Object.keys(fieldLabels)
  const header = ['이름', '학번', '신청일시', '상태', ...fieldIds.map((id) => fieldLabels[id])]
  const lines = rows.map((row) =>
    [row.name, row.studentId, row.appliedAt, row.status, ...fieldIds.map((id) => row.answers[id] ?? '')]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function EventApplicantsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getEvent, getApplicants, cancelApplicant } = useEvents()
  const toast = useToast()

  const event = id ? getEvent(id) : undefined
  const applicants = id ? getApplicants(id) : []
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [cancelTarget, setCancelTarget] = useState<Applicant | null>(null)
  const [search, setSearch] = useState('')

  const filtered = applicants.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false
    const keyword = search.trim()
    if (!keyword) return true
    return a.name.includes(keyword) || a.studentId.includes(keyword)
  })

  const fieldLabels = useMemo(() => {
    const map: Record<string, string> = {}
    event?.formFields.forEach((field) => {
      map[field.id] = field.label || '(이름 없는 항목)'
    })
    return map
  }, [event])

  const handleExport = () => {
    const csv = toCsv(filtered, fieldLabels)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event?.title ?? '행사'}_신청자명단.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({ content: '신청자 명단을 내보냈어요.', variant: 'positive' })
  }

  const columns: DataTableColumn<Applicant>[] = [
    { key: 'name', header: '이름', width: 120, render: (row) => row.name },
    { key: 'studentId', header: '학번', width: 140, render: (row) => row.studentId },
    { key: 'appliedAt', header: '신청일시', width: 140, render: (row) => row.appliedAt },
    ...Object.keys(fieldLabels).map<DataTableColumn<Applicant>>((fieldId) => ({
      key: fieldId,
      header: fieldLabels[fieldId],
      render: (row) => row.answers[fieldId] ?? '-',
    })),
    {
      key: 'status',
      header: '상태',
      width: 100,
      render: (row) => <StatusBadge label={row.status} tone={row.status === '취소' ? 'negative' : 'positive'} />,
    },
    {
      key: 'actions',
      header: '',
      width: 100,
      align: 'right',
      render: (row) =>
        row.status === '신청완료' ? (
          <TextButton size="small" color="assistive" onClick={() => setCancelTarget(row)}>
            취소 처리
          </TextButton>
        ) : (
          <Typography variant="label2" color="semantic.label.alternative">
            -
          </Typography>
        ),
    },
  ]

  if (!event) {
    return (
      <FlexBox flexDirection="column" style={{ gap: 12 }}>
        <Typography variant="title2" weight="bold">
          행사를 찾을 수 없어요.
        </Typography>
        <FlexBox>
          <TextButton onClick={() => navigate('/events')}>행사 목록으로 돌아가기</TextButton>
        </FlexBox>
      </FlexBox>
    )
  }

  return (
    <>
      <PageHeader
        title={`${event.title} - 신청 현황`}
        description={`총 ${applicants.length}명 신청 (신청완료 ${applicants.filter((a) => a.status === '신청완료').length}명)`}
        action={
          <Button variant="outlined" color="primary" onClick={handleExport}>
            엑셀 내보내기
          </Button>
        }
      />

      <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
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
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="신청을 취소 처리할까요?"
        description={cancelTarget ? `${cancelTarget.name}(${cancelTarget.studentId})님의 신청을 취소 처리해요.` : undefined}
        confirmLabel="취소 처리"
        tone="negative"
        onConfirm={() => {
          if (cancelTarget) {
            cancelApplicant(cancelTarget.id)
            toast({ content: '신청이 취소 처리되었어요.', variant: 'normal' })
          }
        }}
      />
    </>
  )
}

export default EventApplicantsPage
