import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading,
  Typography,
  useToast,
} from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import DetailInfoGrid from '../../components/common/DetailInfoGrid'
import SearchField from '../../components/common/SearchField'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import ExcelExportButton from '../../components/common/ExcelExportButton'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import NotFoundState from '../../components/common/NotFoundState'
import { useEvents } from './store'
import type { Applicant } from './types'

type StatusFilter = 'all' | '신청완료' | '취소'

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
  const { getEvent, getApplicants, cancelApplicant } = useEvents()
  const toast = useToast()

  const event = id ? getEvent(id) : undefined
  const applicants = id ? getApplicants(id) : []
  const [filters, setFilters] = useState<StatusFilter[]>(['all'])
  const [cancelTarget, setCancelTarget] = useState<Applicant | null>(null)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [search, setSearch] = useState('')

  const filtered = applicants.filter((a) => {
    if (!filters.includes('all') && !filters.includes(a.status)) return false
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
      header: <span title={fieldLabels[fieldId]} style={{ display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fieldLabels[fieldId]}</span>,
      width: 200,
      render: (row) => <span style={{ display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.answers[fieldId] || '-'}</span>,
    })),
    {
      key: 'status',
      header: <TableCheckboxFilter label="상태" ariaLabel="행사 신청 상태 필터" allLabel="전체 상태" options={['신청완료', '취소']} value={filters} onChange={(value) => setFilters(value as StatusFilter[])} />,
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
          <Button variant="outlined" color="assistive" size="small" style={{ color: 'var(--semantic-status-negative)', borderColor: 'var(--semantic-line-normal-normal)' }} onClick={(clickEvent) => { clickEvent.stopPropagation(); setCancelTarget(row) }}>
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
    return <NotFoundState entity="행사" onBack={() => navigate('/events')} />
  }

  return (
    <>
      <PageHeader
        title={`${event.title} - 신청 현황`}
        description={`총 ${applicants.length}명 신청 (신청완료 ${applicants.filter((a) => a.status === '신청완료').length}명)`}
      />

      <FlexBox className="app-page-toolbar" justifyContent="flex-end" alignItems="center" style={{ marginBottom: 16, gap: 12 }}>
        <SearchField value={search} onChange={setSearch} placeholder="이름 또는 학번 검색" />
        <ExcelExportButton onClick={handleExport} disabled={filtered.length === 0} />
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        onRowClick={setSelectedApplicant}
        emptyMessage={applicants.length === 0 ? '신청자가 없어요.' : '조건에 맞는 신청자가 없어요.'}
        emptyDescription={applicants.length > 0 ? '검색어나 필터를 변경해 보세요.' : undefined}
        minWidth={720 + Object.keys(fieldLabels).length * 200}
      />

      <Modal open={Boolean(selectedApplicant)} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
        <ModalContainer size="large"><ModalContent>
          <ModalContentItem><ModalHeading>{selectedApplicant ? `${selectedApplicant.name}님 신청 내역` : '신청 내역'}</ModalHeading></ModalContentItem>
          {selectedApplicant && <ModalContentItem style={{ gap: 20, maxHeight: '65vh', overflowY: 'auto' }}>
            <DetailInfoGrid items={[
              { label: '이름', value: selectedApplicant.name },
              { label: '학번', value: selectedApplicant.studentId },
              { label: '전화번호', value: selectedApplicant.phone },
              { label: '신청일시', value: selectedApplicant.appliedAt },
              { label: '상태', value: <StatusBadge label={selectedApplicant.status} tone={selectedApplicant.status === '취소' ? 'negative' : 'positive'} /> },
            ]} />
            <FlexBox flexDirection="column" style={{ gap: 16, borderTop: '1px solid var(--semantic-line-normal-normal)', paddingTop: 20 }}>
              <Typography variant="body1" weight="bold">신청 폼 답변</Typography>
              {event.formFields.length === 0 ? <Typography variant="body2" color="semantic.label.alternative">추가 질문이 없어요.</Typography> : event.formFields.map((field) => <FlexBox key={field.id} flexDirection="column" style={{ gap: 6 }}>
                <Typography variant="caption1" color="semantic.label.alternative" style={{ overflowWrap: 'anywhere' }}>{field.label || '(이름 없는 항목)'}</Typography>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{selectedApplicant.answers[field.id] || '-'}</Typography>
              </FlexBox>)}
            </FlexBox>
          </ModalContentItem>}
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end' }}><Button variant="outlined" color="assistive" onClick={() => setSelectedApplicant(null)}>닫기</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>

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
