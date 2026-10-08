import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger,
  TextButton,
  Tooltip, TooltipContent, TooltipTrigger,
  Typography,
  useToast,
} from '@wanteddev/wds'
import { IconChevronDownSmall, IconCircleQuestion } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import ExcelExportButton from '../../components/common/ExcelExportButton'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import { useEvents } from './store'
import { getAttendanceStatus, type Applicant } from './types'
import type { BadgeTone } from '../../components/common/StatusBadge'

type StatusFilter = 'all' | '신청완료' | '취소'
type AttendanceFilter = 'all' | '미확정' | '참가완료' | '불참'
const attendanceTone: Record<'미확정' | '참가완료' | '불참', BadgeTone> = { 미확정: 'neutral', 참가완료: 'positive', 불참: 'negative' }

function toCsv(rows: Applicant[], fieldLabels: Record<string, string>) {
  const fieldIds = Object.keys(fieldLabels)
  const header = ['이름', '학번', '전화번호', '신청일시', '상태', ...fieldIds.map((id) => fieldLabels[id])]
  const lines = rows.map((row) =>
    [row.name, row.studentId, row.phone, row.appliedAt, row.status, ...fieldIds.map((id) => row.answers[id] ?? '')]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function EventApplicantsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getEvent, getApplicants, cancelApplicant, updateAttendanceStatus } = useEvents()
  const toast = useToast()

  const event = id ? getEvent(id) : undefined
  const applicants = id ? getApplicants(id) : []
  const [filters, setFilters] = useState<StatusFilter[]>(['all'])
  const [attendanceFilters, setAttendanceFilters] = useState<AttendanceFilter[]>(['all'])
  const [cancelTarget, setCancelTarget] = useState<Applicant | null>(null)
  const [search, setSearch] = useState('')

  const filtered = applicants.filter((a) => {
    if (!filters.includes('all') && !filters.includes(a.status)) return false
    const attendance = getAttendanceStatus(a, event!)
    if (attendance !== '-' && !attendanceFilters.includes('all') && !attendanceFilters.includes(attendance)) return false
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
    { key: 'phone', header: '전화번호', width: 150, render: (row) => row.phone },
    { key: 'appliedAt', header: '신청일시', width: 140, render: (row) => row.appliedAt },
    ...Object.keys(fieldLabels).map<DataTableColumn<Applicant>>((fieldId) => ({
      key: fieldId,
      header: fieldLabels[fieldId],
      render: (row) => row.answers[fieldId] ?? '-',
    })),
    {
      key: 'status',
      header: <TableCheckboxFilter label="상태" ariaLabel="행사 신청 상태 필터" allLabel="전체 상태" options={['신청완료', '취소']} value={filters} onChange={(value) => setFilters(value as StatusFilter[])} />,
      width: 100,
      render: (row) => <StatusBadge label={row.status} tone={row.status === '취소' ? 'negative' : 'positive'} />,
    },
    {
      key: 'attendance', header: <TableCheckboxFilter label="참석 여부" ariaLabel="참석 여부 필터" allLabel="전체 참석 여부" options={['미확정', '참가완료', '불참']} value={attendanceFilters} onChange={(value) => setAttendanceFilters(value as AttendanceFilter[])} />, width: 150,
      render: (row) => {
        const attendance = getAttendanceStatus(row, event!)
        if (attendance === '-') return '-'
        return <Menu><MenuTrigger><span className="app-hoverable" style={{ display: 'inline-flex', cursor: 'pointer', borderRadius: 8 }}><StatusBadge label={attendance} tone={attendanceTone[attendance]} trailingContent={<IconChevronDownSmall width={18} height={18} />} /></span></MenuTrigger><MenuContent position="bottom-end" offset={8}><MenuList>{(['미확정', '불참', '참가완료'] as const).map((status) => <MenuItem key={status} value={status} onClick={() => updateAttendanceStatus(row.id, status)}><StatusBadge label={status} tone={attendanceTone[status]} /></MenuItem>)}</MenuList></MenuContent></Menu>
      },
    },
    {
      key: 'actions',
      header: '',
      width: 100,
      align: 'right',
      render: (row) =>
        row.status === '신청완료' ? (
          <Button variant="outlined" color="assistive" size="small" style={{ color: 'var(--semantic-status-negative)', borderColor: 'var(--semantic-line-normal-normal)' }} onClick={() => setCancelTarget(row)}>
            취소 처리
          </Button>
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
      />

      <FlexBox className="app-page-toolbar" justifyContent="flex-end" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
        <Tooltip mode="hover">
          <TooltipTrigger>
            <IconButton variant="normal" size="small" aria-label="참석 여부 안내" style={{ width: 32, height: 32 }}>
              <IconCircleQuestion width={17} height={17} style={{ color: 'var(--semantic-label-assistive)' }} />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>행사가 종료되면 자동으로 모두 참가완료 상태로 바뀌어요.</TooltipContent>
        </Tooltip>
        <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
        <ExcelExportButton onClick={handleExport} />
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="신청자가 없어요."
        minWidth={1000 + Object.keys(fieldLabels).length * 160}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="신청을 취소 처리하고 알림을 보낼까요?"
        description={cancelTarget ? `${cancelTarget.name}(${cancelTarget.studentId})님의 신청을 취소 처리하고, 취소 안내 알림을 보내요.` : undefined}
        confirmLabel="취소 처리"
        tone="negative"
        onConfirm={() => {
          if (cancelTarget) {
            cancelApplicant(cancelTarget.id)
            toast({ content: '신청이 취소 처리되고 사용자에게 알림을 보냈어요.', variant: 'positive' })
          }
        }}
      />
    </>
  )
}

export default EventApplicantsPage
