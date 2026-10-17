import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger, Typography, useToast } from '@wanteddev/wds'
import { IconMoreVertical } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import StatusBadgeDropdown from '../../components/common/StatusBadgeDropdown'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import { useEvents } from './store'
import { formatEventDateTime, getEventStatus, type EventRecord, type EventStatus } from './types'

const statusTone: Record<EventStatus, BadgeTone> = {
  모집예정: 'cautionary',
  모집중: 'info',
  모집종료: 'neutral',
}

type VisibilityChangeTarget = {
  event: EventRecord
  nextIsPublic: boolean
}

function EventListPage() {
  const navigate = useNavigate()
  const { events, getApplicants, deleteEvent, setEventVisibility } = useEvents()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [visibilityTarget, setVisibilityTarget] = useState<VisibilityChangeTarget | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(['all'])
  const [visibilityFilters, setVisibilityFilters] = useState<string[]>(['all'])

  const filtered = events.filter((event) =>
    event.title.includes(search.trim())
    && (statusFilters.includes('all') || statusFilters.includes(getEventStatus(event)))
    && (visibilityFilters.includes('all') || visibilityFilters.includes(event.isPublic ? 'public' : 'private')),
  )

  const columns: DataTableColumn<EventRecord>[] = [
    {
      key: 'title',
      header: '행사명',
      render: (event) => (
        <FlexBox alignItems="center" style={{ gap: 12 }}>
          {event.thumbnailUrl && <img src={event.thumbnailUrl} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
          <FlexBox flexDirection="column" style={{ gap: 2 }}>
          <Typography variant="body1" weight="medium">
            {event.title}
          </Typography>
          <Typography variant="caption1" color="semantic.label.alternative">
            신청자 {getApplicants(event.id).filter((a) => a.status === '신청완료').length}명
            {event.capacity ? ` / 정원 ${event.capacity}명` : ' / 인원 제한 없음'}
          </Typography>
          </FlexBox>
        </FlexBox>
      ),
    },
    {
      key: 'status',
      header: <TableCheckboxFilter label="상태" ariaLabel="행사 상태 필터" options={['모집예정', '모집중', '모집종료']} value={statusFilters} onChange={setStatusFilters} />,
      width: 100,
      render: (event) => {
        const status = getEventStatus(event)
        return <StatusBadge label={status} tone={statusTone[status]} />
      },
    },
    {
      key: 'visibility',
      header: <TableCheckboxFilter label="공개 상태" ariaLabel="행사 공개 상태 필터" options={[{ value: 'public', label: '공개' }, { value: 'private', label: '비공개' }]} value={visibilityFilters} onChange={setVisibilityFilters} />,
      width: 120,
      render: (event) => <span onClick={(clickEvent) => clickEvent.stopPropagation()}><StatusBadgeDropdown value={event.isPublic ? 'public' : 'private'} options={[{ value: 'public', label: '공개', tone: 'positive' }, { value: 'private', label: '비공개', tone: 'neutral' }]} onChange={(value) => setVisibilityTarget({ event, nextIsPublic: value === 'public' })} /></span>,
    },
    {
      key: 'period',
      header: '신청 기간',
      render: (event) => `${formatEventDateTime(event.openDate, event.openTime)} ~ ${formatEventDateTime(event.deadline, event.deadlineTime)}`,
    },
    {
      key: 'actions',
      header: '',
      width: 150,
      align: 'right',
      render: (event) => (
        <FlexBox alignItems="center" justifyContent="flex-end" onClick={(clickEvent) => clickEvent.stopPropagation()} style={{ gap: 8 }}>
          <Button variant="outlined" color="primary" size="small" onClick={() => navigate(`/events/${event.id}/applicants`)}>신청 현황</Button>
          <Menu open={openMenuId === event.id} onOpenChange={(open) => setOpenMenuId(open ? event.id : null)}>
            <MenuTrigger>
              <IconButton variant="normal" size="small" aria-label={`${event.title} 더보기`}>
                <IconMoreVertical width={20} height={20} />
              </IconButton>
            </MenuTrigger>
            <MenuContent position="bottom-end" offset={4}>
              <MenuList>
                <MenuItem value="visibility" onClick={() => { setVisibilityTarget({ event, nextIsPublic: !event.isPublic }); setOpenMenuId(null) }}>
                  {event.isPublic ? '비공개 처리' : '공개 처리'}
                </MenuItem>
                <MenuItem value="edit" onClick={() => { navigate(`/events/${event.id}/edit`); setOpenMenuId(null) }}>
                  수정
                </MenuItem>
                <MenuItem value="delete" onClick={() => { setDeleteTarget(event); setOpenMenuId(null) }} style={{ color: 'var(--semantic-status-negative)' }}>
                  삭제
                </MenuItem>
              </MenuList>
            </MenuContent>
          </Menu>
        </FlexBox>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="행사 관리" description="행사를 등록하고 신청 현황을 관리해요." />

      <FlexBox className="app-page-toolbar" justifyContent="flex-end" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="행사명 검색" />
        <Button variant="solid" color="primary" size="medium" onClick={() => navigate('/events/new')}>+ 새 행사 등록</Button>
      </FlexBox>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(event) => event.id}
        onRowClick={(event) => navigate(`/events/${event.id}`)}
        emptyMessage={events.length === 0 ? '등록된 행사가 없어요.' : '조건에 맞는 행사가 없어요.'}
        emptyDescription={events.length > 0 ? '검색어나 필터를 변경해 보세요.' : undefined}
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
      <ConfirmModal
        open={Boolean(visibilityTarget)}
        onOpenChange={(open) => !open && setVisibilityTarget(null)}
        title={visibilityTarget?.nextIsPublic ? '행사를 공개로 변경할까요?' : '행사를 비공개로 변경할까요?'}
        description={visibilityTarget?.nextIsPublic ? '공개로 변경하면 사용자가 행사와 신청 폼을 볼 수 있어요.' : '비공개로 변경하면 사용자에게 행사와 신청 폼이 노출되지 않아요.'}
        confirmLabel={visibilityTarget?.nextIsPublic ? '공개로 변경' : '비공개로 변경'}
        onConfirm={() => {
          if (!visibilityTarget) return
          setEventVisibility(visibilityTarget.event.id, visibilityTarget.nextIsPublic)
          toast({ content: visibilityTarget.nextIsPublic ? '행사를 공개로 변경했어요.' : '행사를 비공개로 변경했어요.', variant: 'positive' })
        }}
      />
    </>
  )
}

export default EventListPage
