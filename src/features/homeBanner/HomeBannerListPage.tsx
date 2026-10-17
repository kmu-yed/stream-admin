import { useState, type DragEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  SegmentedControl,
  SegmentedControlItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Typography,
} from '@wanteddev/wds'
import { IconMenu } from '@wanteddev/wds-icon'
import DataTable, { DEFAULT_TABLE_PAGE_SIZE, type DataTableColumn } from '../../components/common/DataTable'
import TablePagination from '../../components/common/TablePagination'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowMoreMenu from '../../components/common/RowMoreMenu'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import { useHomeBanner } from './store'
import { getBannerBadge, getBannerExposureStatus, type Banner, type BannerExposureStatus } from './types'

const exposureTone: Record<BannerExposureStatus, BadgeTone> = {
  노출중: 'positive',
  노출예정: 'info',
  노출종료: 'neutral',
}

function HomeBannerListPage() {
  const navigate = useNavigate()
  const { banners, deleteBanner, reorderBanner } = useHomeBanner()
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [categoryFilters, setCategoryFilters] = useState<string[]>(['all'])
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>(['all'])
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'active'

  const activeSource = banners
    .filter((banner) => getBannerExposureStatus(banner) !== '노출종료')
    .sort((a, b) => a.order - b.order)
  const activeBanners = activeSource.filter((banner) =>
    (categoryFilters.includes('all') || categoryFilters.includes(getBannerBadge(banner.category)))
    && (activeStatusFilters.includes('all') || activeStatusFilters.includes(getBannerExposureStatus(banner))),
  )
  const pastSource = banners
    .filter((banner) => getBannerExposureStatus(banner) === '노출종료')
    .sort((a, b) => b.endDate.localeCompare(a.endDate))
  const pastBanners = pastSource.filter((banner) => categoryFilters.includes('all') || categoryFilters.includes(getBannerBadge(banner.category)))
  const activeTotalPages = Math.ceil(activeBanners.length / DEFAULT_TABLE_PAGE_SIZE)
  const currentActivePage = Math.min(activePage, Math.max(activeTotalPages, 1))

  const pastColumns: DataTableColumn<Banner>[] = [
    {
      key: 'category',
      header: <TableCheckboxFilter label="카테고리" ariaLabel="배너 카테고리 필터" options={['제휴공지', '일반공지']} value={categoryFilters} onChange={setCategoryFilters} />,
      width: 110,
      render: (row) => (
        <StatusBadge label={getBannerBadge(row.category)} tone={row.category === '제휴' ? 'info' : 'neutral'} />
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
            {row.category} · {row.landingType === 'notice' ? '공지 상세 연결' : '외부 링크'}
          </Typography>
        </FlexBox>
      ),
    },
    {
      key: 'period',
      header: '노출 기간',
      width: 220,
      render: (row) => <span style={{ whiteSpace: 'nowrap' }}>{`${row.startDate} ~ ${row.endDate}`}</span>,
    },
    { key: 'status', header: '상태', width: 100, render: () => <StatusBadge label="노출종료" tone="neutral" /> },
    {
      key: 'actions',
      header: '',
      width: 56,
      align: 'right',
      render: (row) => <span onClick={(event) => event.stopPropagation()}><RowMoreMenu label={row.title} onEdit={() => navigate(`/home-banner/${row.id}/edit`)} onDelete={() => setDeleteTarget(row)} /></span>,
    },
  ]

  const handleDrop = (e: DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain')
    if (draggedId) reorderBanner(draggedId, targetId)
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <>
      <FlexBox className="app-page-toolbar" justifyContent="space-between" alignItems="center" style={{ gap: 12, marginBottom: 16 }}>
        <SegmentedControl value={tab} onValueChange={(value) => setSearchParams({ tab: value })} size="medium" style={{ width: 196 }}>
          <SegmentedControlItem value="active">노출 중</SegmentedControlItem>
          <SegmentedControlItem value="past">지난 배너</SegmentedControlItem>
        </SegmentedControl>
        {tab === 'active' && <Button variant="solid" color="primary" onClick={() => navigate('/home-banner/new')}>+ 새 배너 등록</Button>}
      </FlexBox>

      {tab === 'active' && (
      <>
      <Table className="data-table">
        <TableHead>
          <TableRow>
            <TableHeadCell style={{ width: 40 }} />
            <TableHeadCell style={{ width: 60 }}>순서</TableHeadCell>
            <TableHeadCell style={{ width: 110 }}><TableCheckboxFilter label="카테고리" ariaLabel="배너 카테고리 필터" options={['제휴공지', '일반공지']} value={categoryFilters} onChange={setCategoryFilters} /></TableHeadCell>
            <TableHeadCell>제목</TableHeadCell>
            <TableHeadCell style={{ width: 220 }}>노출 기간</TableHeadCell>
            <TableHeadCell style={{ width: 100 }}><TableCheckboxFilter label="상태" ariaLabel="배너 노출 상태 필터" options={['노출중', '노출예정']} value={activeStatusFilters} onChange={setActiveStatusFilters} /></TableHeadCell>
            <TableHeadCell style={{ width: 56 }} align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {activeBanners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" style={{ padding: 0 }}>
                <EmptyState message={activeSource.length === 0 ? '노출 중이거나 노출 예정인 배너가 없어요.' : '조건에 맞는 배너가 없어요.'} description={activeSource.length === 0 ? '새 배너를 등록하면 여기에 표시돼요.' : '필터를 변경해 보세요.'} variant="table" />
              </TableCell>
            </TableRow>
          ) : (
            activeBanners.slice((currentActivePage - 1) * DEFAULT_TABLE_PAGE_SIZE, currentActivePage * DEFAULT_TABLE_PAGE_SIZE).map((banner, index) => {
              const status = getBannerExposureStatus(banner)
              return (
                <TableRow
                  key={banner.id}
                  onClick={() => navigate(`/home-banner/${banner.id}`)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverId(banner.id)
                  }}
                  onDragLeave={() => setDragOverId((prev) => (prev === banner.id ? null : prev))}
                  onDrop={(e) => handleDrop(e, banner.id)}
                  style={{
                    cursor: 'pointer',
                    background:
                      dragOverId === banner.id && draggingId !== banner.id
                        ? 'var(--semantic-fill-normal)'
                        : undefined,
                  }}
                >
                  <TableCell>
                    <FlexBox
                      draggable
                      onClick={(event) => event.stopPropagation()}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', banner.id)
                        e.dataTransfer.effectAllowed = 'move'
                        setDraggingId(banner.id)
                      }}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDragOverId(null)
                      }}
                      alignItems="center"
                      justifyContent="center"
                      style={{ cursor: 'grab', width: 24, height: 24 }}
                    >
                      <IconMenu width={16} height={16} style={{ color: 'var(--semantic-label-alternative)' }} />
                    </FlexBox>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{(currentActivePage - 1) * DEFAULT_TABLE_PAGE_SIZE + index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={getBannerBadge(banner.category)}
                      tone={banner.category === '제휴' ? 'info' : 'neutral'}
                    />
                  </TableCell>
                  <TableCell>
                    <FlexBox flexDirection="column" style={{ gap: 2 }}>
                      <Typography variant="body1" weight="medium">
                        {banner.title}
                      </Typography>
                      <Typography variant="caption1" color="semantic.label.alternative">
                        {banner.category} · {banner.landingType === 'notice' ? '공지 상세 연결' : '외부 링크'}
                      </Typography>
                    </FlexBox>
                  </TableCell>
                  <TableCell>
                    <span style={{ whiteSpace: 'nowrap' }}>{`${banner.startDate} ~ ${banner.endDate}`}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={status} tone={exposureTone[status]} />
                  </TableCell>
                  <TableCell align="right">
                    <span onClick={(event) => event.stopPropagation()}><RowMoreMenu label={banner.title} onEdit={() => navigate(`/home-banner/${banner.id}/edit`)} onDelete={() => setDeleteTarget(banner)} /></span>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      <TablePagination page={currentActivePage} totalPages={activeTotalPages} onChange={(nextPage) => setActivePage(nextPage ?? 1)} />
      </>
      )}

      {tab === 'past' && (
          <DataTable
            columns={pastColumns}
            rows={pastBanners}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/home-banner/${row.id}`)}
            emptyMessage={pastSource.length === 0 ? '노출이 종료된 배너가 없어요.' : '조건에 맞는 배너가 없어요.'}
            emptyDescription={pastSource.length > 0 ? '필터를 변경해 보세요.' : undefined}
          />
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="배너를 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.title}" 배너를 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteBanner(deleteTarget.id)
        }}
      />
    </>
  )
}

export default HomeBannerListPage
