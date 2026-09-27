import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger, Typography, TextButton, useToast } from '@wanteddev/wds'
import { IconMoreVertical } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useEvents } from './store'
import { getEventStatus, type EventRecord, type EventStatus } from './types'

const statusTone: Record<EventStatus, BadgeTone> = {
  모집예정: 'cautionary',
  모집중: 'info',
  모집종료: 'neutral',
}

function EventListPage() {
  const navigate = useNavigate()
  const { events, getApplicants, deleteEvent, toggleEventVisibility } = useEvents()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null)
  const [visibilityTarget, setVisibilityTarget] = useState<EventRecord | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
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
      key: 'visibility',
      header: '공개 상태',
      width: 100,
      render: (event) => <StatusBadge label={event.isPublic ? '공개' : '비공개'} tone={event.isPublic ? 'positive' : 'neutral'} />,
    },
    {
      key: 'period',
      header: '신청 오픈일 ~ 모집 마감일',
      render: (event) => `${event.openDate} ~ ${event.deadline}`,
    },
    {
      key: 'actions',
      header: '',
      width: 150,
      align: 'right',
      render: (event) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 8 }}>
          <TextButton size="small" onClick={() => navigate(`/events/${event.id}/applicants`)}>
            신청 현황
          </TextButton>
          <Menu open={openMenuId === event.id} onOpenChange={(open) => setOpenMenuId(open ? event.id : null)}>
            <MenuTrigger>
              <IconButton variant="normal" size="small" aria-label={`${event.title} 더보기`}>
                <IconMoreVertical width={20} height={20} />
              </IconButton>
            </MenuTrigger>
            <MenuContent position="bottom-end" offset={4}>
              <MenuList>
                <MenuItem value="visibility" onClick={() => { setVisibilityTarget(event); setOpenMenuId(null) }}>
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

      <FlexBox justifyContent="flex-end" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="행사명 검색" />
        <Button variant="solid" color="primary" onClick={() => navigate('/events/new')}>+ 새 행사 등록</Button>
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
      <ConfirmModal
        open={Boolean(visibilityTarget)}
        onOpenChange={(open) => !open && setVisibilityTarget(null)}
        title={visibilityTarget?.isPublic ? '행사를 비공개 처리할까요?' : '행사를 공개 처리할까요?'}
        description={visibilityTarget?.isPublic
          ? '비공개 처리하면 사용자에게 행사와 신청 폼이 노출되지 않아요.'
          : '공개 처리하면 사용자가 행사와 신청 폼을 볼 수 있어요.'}
        confirmLabel={visibilityTarget?.isPublic ? '비공개 처리' : '공개 처리'}
        onConfirm={() => {
          if (!visibilityTarget) return
          toggleEventVisibility(visibilityTarget.id)
          toast({
            content: visibilityTarget.isPublic ? '행사를 비공개 처리했어요.' : '행사를 공개 처리했어요.',
            variant: 'positive',
          })
        }}
      />
    </>
  )
}

export default EventListPage
