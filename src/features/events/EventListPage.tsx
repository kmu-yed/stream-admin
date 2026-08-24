import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Typography, TextButton } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowActionButton from '../../components/common/RowActionButton'
import { useEvents } from './store'
import { getEventStatus, type EventRecord, type EventStatus } from './types'

const statusTone: Record<EventStatus, BadgeTone> = {
  모집예정: 'cautionary',
  모집중: 'info',
  모집종료: 'neutral',
}

function EventListPage() {
  const navigate = useNavigate()
  const { events, getApplicants, deleteEvent } = useEvents()
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [search, setSearch] = useState('')

  const filtered = events.filter((event) => event.title.includes(search.trim()))

  const columns: DataTableColumn<EventRecord>[] = [
    {
      key: 'title',
      header: '행사명',
      render: (event) => (
        <FlexBox flexDirection="column" style={{ gap: 2 }}>
          <Typography variant="body1" weight="medium">
            {event.title}
          </Typography>
          <Typography variant="caption1" color="semantic.label.alternative">
            신청자 {getApplicants(event.id).filter((a) => a.status === '신청완료').length}명
            {event.capacity ? ` / 정원 ${event.capacity}명` : ' / 인원 제한 없음'}
          </Typography>
        </FlexBox>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: 100,
      render: (event) => {
        const status = getEventStatus(event)
        return <StatusBadge label={status} tone={statusTone[status]} />
      },
    },
    {
      key: 'period',
      header: '신청 오픈일 ~ 모집 마감일',
      render: (event) => `${event.openDate} ~ ${event.deadline}`,
    },
    {
      key: 'actions',
      header: '',
      width: 260,
      align: 'right',
      render: (event) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
          <TextButton size="small" onClick={() => navigate(`/events/${event.id}/applicants`)}>
            신청 현황
          </TextButton>
          <RowActionButton onClick={() => navigate(`/events/${event.id}/edit`)}>수정</RowActionButton>
          <RowActionButton danger onClick={() => setDeleteTarget(event)}>
            삭제
          </RowActionButton>
        </FlexBox>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="행사 관리"
        description="행사를 등록하고 신청 현황을 관리해요."
        action={
          <Button variant="solid" color="primary" onClick={() => navigate('/events/new')}>
            + 새 행사 등록
          </Button>
        }
      />

      <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="행사명 검색" />
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(event) => event.id}
        emptyMessage="등록된 행사가 없어요."
      />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="행사를 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.title}" 행사와 신청 내역이 모두 삭제돼요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteEvent(deleteTarget.id)
        }}
      />
    </>
  )
}

export default EventListPage
