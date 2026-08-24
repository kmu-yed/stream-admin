import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, FlexBox, Thumbnail, Typography } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowActionButton from '../../components/common/RowActionButton'
import { useArchiving } from './store'
import type { ArchivePost } from './types'

function ArchiveListPage() {
  const navigate = useNavigate()
  const { posts, deletePost } = useArchiving()
  const [deleteTarget, setDeleteTarget] = useState<ArchivePost | null>(null)
  const [search, setSearch] = useState('')

  const sorted = [...posts]
    .filter((post) => post.title.includes(search.trim()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const columns: DataTableColumn<ArchivePost>[] = [
    {
      key: 'cover',
      header: '',
      width: 64,
      render: (row) =>
        row.coverImageUrl ? (
          <Thumbnail src={row.coverImageUrl} alt="" ratio="1:1" width={40} radius />
        ) : (
          <FlexBox
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--semantic-fill-normal)',
            }}
          />
        ),
    },
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
      width: 140,
      align: 'right',
      render: (row) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
          <RowActionButton onClick={() => navigate(`/archiving/${row.id}/edit`)}>수정</RowActionButton>
          <RowActionButton danger onClick={() => setDeleteTarget(row)}>
            삭제
          </RowActionButton>
        </FlexBox>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="아카이빙 게시물 관리"
        description="노출 순서는 등록일 기준 최신순으로 고정돼요."
        action={
          <Button variant="solid" color="primary" onClick={() => navigate('/archiving/new')}>
            + 새 게시물 등록
          </Button>
        }
      />

      <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <SearchField value={search} onChange={setSearch} placeholder="제목 검색" />
      </FlexBox>

      <DataTable
        columns={columns}
        rows={sorted}
        rowKey={(row) => row.id}
        emptyMessage="등록된 게시물이 없어요."
      />

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
