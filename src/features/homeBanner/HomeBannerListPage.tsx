import { useState, type DragEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  Tab,
  TabList,
  TabListItem,
  TabPanel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Typography,
} from '@wanteddev/wds'
import { IconMenu } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowActionButton from '../../components/common/RowActionButton'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'active'

  const activeBanners = banners
    .filter((banner) => getBannerExposureStatus(banner) !== '노출종료')
    .sort((a, b) => a.order - b.order)
  const pastBanners = banners
    .filter((banner) => getBannerExposureStatus(banner) === '노출종료')
    .sort((a, b) => b.endDate.localeCompare(a.endDate))

  const pastColumns: DataTableColumn<Banner>[] = [
    {
      key: 'category',
      header: '카테고리',
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
      width: 140,
      align: 'right',
      render: (row) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
          <RowActionButton onClick={() => navigate(`/home-banner/${row.id}/edit`)}>수정</RowActionButton>
          <RowActionButton danger onClick={() => setDeleteTarget(row)}>
            삭제
          </RowActionButton>
        </FlexBox>
      ),
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
      <PageHeader
        title="홈 공지 배너 관리"
        description="홈 화면에 노출되는 공지 배너를 등록하고 순서를 관리해요. 손잡이 아이콘을 드래그해 순서를 바꿀 수 있어요."
        action={
          <Button variant="solid" color="primary" onClick={() => navigate('/home-banner/new')}>
            + 새 배너 등록
          </Button>
        }
      />

      <Tab value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="active">노출 중</TabListItem>
          <TabListItem value="past">지난 배너</TabListItem>
        </TabList>

        <TabPanel value="active">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell style={{ width: 40 }} />
            <TableHeadCell style={{ width: 60 }}>순서</TableHeadCell>
            <TableHeadCell style={{ width: 110 }}>카테고리</TableHeadCell>
            <TableHeadCell>제목</TableHeadCell>
            <TableHeadCell style={{ width: 220 }}>노출 기간</TableHeadCell>
            <TableHeadCell style={{ width: 100 }}>상태</TableHeadCell>
            <TableHeadCell style={{ width: 140 }} align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {activeBanners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" style={{ padding: '48px 0' }}>
                <Typography variant="body2" color="semantic.label.alternative">
                  등록된 배너가 없어요.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            activeBanners.map((banner, index) => {
              const status = getBannerExposureStatus(banner)
              return (
                <TableRow
                  key={banner.id}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverId(banner.id)
                  }}
                  onDragLeave={() => setDragOverId((prev) => (prev === banner.id ? null : prev))}
                  onDrop={(e) => handleDrop(e, banner.id)}
                  style={{
                    background:
                      dragOverId === banner.id && draggingId !== banner.id
                        ? 'var(--semantic-fill-normal)'
                        : undefined,
                  }}
                >
                  <TableCell>
                    <FlexBox
                      draggable
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
                    <Typography variant="body2">{index + 1}</Typography>
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
                    <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
                      <RowActionButton onClick={() => navigate(`/home-banner/${banner.id}/edit`)}>
                        수정
                      </RowActionButton>
                      <RowActionButton danger onClick={() => setDeleteTarget(banner)}>
                        삭제
                      </RowActionButton>
                    </FlexBox>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
        </TabPanel>

        <TabPanel value="past">
          <DataTable
            columns={pastColumns}
            rows={pastBanners}
            rowKey={(row) => row.id}
            emptyMessage="노출이 종료된 배너가 없어요."
          />
        </TabPanel>
      </Tab>

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
