import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Typography } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowMoreMenu from '../../components/common/RowMoreMenu'
import { useBoards } from './store'
import type { Notice, NoticeCategory } from './types'

const categoryTone: Record<NoticeCategory, BadgeTone> = {
  일반: 'neutral',
  제휴: 'info',
}

function NoticesPage() {
  const navigate = useNavigate()
  const { notices, deleteNotice } = useBoards()
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null)
  const [search, setSearch] = useState('')

  const sorted = [...notices]
    .filter((notice) => notice.title.includes(search.trim()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.createdAt.localeCompare(a.createdAt)
    })

  const columns: DataTableColumn<Notice>[] = [
    {
      key: 'title',
      header: '제목',
      render: (row) => (
        <FlexBox className="notice-title-cell" alignItems="center" style={{ gap: 6 }}>
          {row.pinned && (
            <img src="/icons/Shape.svg" alt="고정 공지" style={{ width: 14, height: 14, objectFit: 'contain' }} />
          )}
          <Typography className="notice-title-text" variant="body1" weight="medium">
            {row.title}
          </Typography>
        </FlexBox>
      ),
    },
    {
      key: 'category',
      header: '카테고리',
      width: 100,
      render: (row) => <StatusBadge label={row.category} tone={categoryTone[row.category]} />,
    },
    { key: 'createdAt', header: '등록일', width: 120, render: (row) => row.createdAt },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) => <span onClick={(event) => event.stopPropagation()}><RowMoreMenu label={row.title} onEdit={() => navigate(`/notices/${row.id}/edit`)} onDelete={() => setDeleteTarget(row)} /></span>,
    },
  ]

  return (
    <>
      <PageHeader title="공지 관리" description="게시판에 노출되는 공지를 관리해요." />

      <FlexBox className="app-page-toolbar" justifyContent="flex-end" style={{ gap: 12, marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="제목 검색" />
        <Button variant="solid" color="primary" size="medium" onClick={() => navigate('/notices/new')}>+ 새 공지 등록</Button>
      </FlexBox>

      <DataTable
        columns={columns}
        rows={sorted}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/notices/${row.id}`)}
        emptyMessage="등록된 공지가 없어요."
        className="notices-table"
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="공지를 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.title}" 공지를 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteNotice(deleteTarget.id)
        }}
      />
    </>
  )
}

export default NoticesPage
