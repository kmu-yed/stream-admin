import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, FlexBox, Menu, MenuContent, MenuItem, MenuList, MenuTrigger, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowMoreMenu from '../../components/common/RowMoreMenu'
import { useArchiving } from './store'
import type { ArchivePost } from './types'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import StatusBadgeDropdown from '../../components/common/StatusBadgeDropdown'

type SlangjeFilter = 'all' | 'visible' | 'hidden'

function ArchiveListPage() {
  const navigate = useNavigate()
  const { posts, deletePost, updateSlangjeInclusion } = useArchiving()
  const toast = useToast()
  const [deleteTarget, setDeleteTarget] = useState<ArchivePost | null>(null)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [slangjeFilters, setSlangjeFilters] = useState<SlangjeFilter[]>(['all'])

  const sorted = [...posts]
    .filter((post) => post.title.includes(search.trim()))
    .filter((post) => slangjeFilters.includes('all') || slangjeFilters.includes(post.includeInSlangje ? 'visible' : 'hidden'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const columns: DataTableColumn<ArchivePost>[] = [
    { key: 'select', header: <Checkbox checked={sorted.length > 0 && sorted.every((post) => selectedIds.includes(post.id))} onCheckedChange={(checked) => setSelectedIds(checked ? sorted.map((post) => post.id) : [])} />, width: 48, align: 'center', render: (row) => <span onClick={(event) => event.stopPropagation()}><Checkbox checked={selectedIds.includes(row.id)} onCheckedChange={(checked) => setSelectedIds((prev) => checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} /></span> },
    { key: 'slangje', header: <TableCheckboxFilter label="슬랑제 페이지 여부" ariaLabel="슬랑제 페이지 여부 필터" options={[{ value: 'visible', label: '노출' }, { value: 'hidden', label: '비노출' }]} value={slangjeFilters} onChange={(value) => setSlangjeFilters(value as SlangjeFilter[])} />, width: 180, render: (row) => <span onClick={(event) => event.stopPropagation()}><StatusBadgeDropdown value={row.includeInSlangje ? 'visible' : 'hidden'} options={[{ value: 'visible', label: '노출', tone: 'positive' }, { value: 'hidden', label: '비노출', tone: 'neutral' }]} onChange={(value) => updateSlangjeInclusion(row.id, value === 'visible')} /></span> },
    {
      key: 'title',
      header: '제목',
      render: (row) => (
        <FlexBox flexDirection="column" style={{ gap: 2 }}>
          <Typography variant="body1" weight="medium">
            {row.title}
          </Typography>
          <Typography variant="caption1" color="semantic.label.alternative">
            {row.date} · {row.location} · {row.department}
          </Typography>
        </FlexBox>
      ),
    },
    { key: 'createdAt', header: '등록일', width: 120, render: (row) => row.createdAt },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) => <span onClick={(event) => event.stopPropagation()}><RowMoreMenu label={row.title} onEdit={() => navigate(`/archiving/${row.id}/edit`)} onDelete={() => setDeleteTarget(row)} /></span>,
    },
  ]

  return (
    <>
      <PageHeader title="아카이빙 관리" description="노출 순서는 등록일 기준 최신순으로 고정돼요." />

      <FlexBox className="app-page-toolbar" justifyContent="flex-end" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="제목 검색" />
        <Button variant="solid" color="primary" size="medium" onClick={() => navigate('/archiving/new')}>+ 새 게시물 등록</Button>
      </FlexBox>

      <FlexBox style={{ position: 'relative', width: '100%' }}>
        {selectedIds.length > 0 && <FlexBox alignItems="center" style={{ position: 'absolute', zIndex: 2, bottom: 'calc(100% + 12px)', height: 48, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 12, background: 'var(--semantic-background-elevated-normal)', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,.12)' }}><Typography variant="body2" weight="bold" style={{ padding: '0 16px', color: 'var(--semantic-primary-normal)' }}>{selectedIds.length}개 선택됨</Typography><Menu><MenuTrigger><button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: '100%', padding: '0 16px', border: 0, borderLeft: '1px solid var(--semantic-line-normal-normal)', background: 'transparent', color: 'var(--semantic-label-normal)', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>슬랑제 페이지 여부</button></MenuTrigger><MenuContent position="bottom-start" offset={8}><MenuList><MenuItem value="visible" onClick={() => { selectedIds.forEach((postId) => updateSlangjeInclusion(postId, true)); toast({ content: '선택한 게시물을 슬랑제 페이지에 노출했어요.', variant: 'positive' }); setSelectedIds([]) }}>노출</MenuItem><MenuItem value="hidden" onClick={() => { selectedIds.forEach((postId) => updateSlangjeInclusion(postId, false)); toast({ content: '선택한 게시물을 슬랑제 페이지에서 숨겼어요.', variant: 'positive' }); setSelectedIds([]) }}>비노출</MenuItem></MenuList></MenuContent></Menu></FlexBox>}
        <DataTable columns={columns} rows={sorted} rowKey={(row) => row.id} rowNumberPosition="after-first-column" onRowClick={(row) => navigate(`/archiving/${row.id}`)} emptyMessage="등록된 게시물이 없어요." style={{ width: '100%' }} />
      </FlexBox>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="게시물을 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.title}" 게시물을 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deletePost(deleteTarget.id)
        }}
      />
    </>
  )
}

export default ArchiveListPage
