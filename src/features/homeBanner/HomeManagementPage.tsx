import { useState, type DragEvent } from 'react'
import { FlexBox, Tab, TabList, TabListItem, TabPanel, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Typography } from '@wanteddev/wds'
import { IconMenu } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import { useEvents } from '../events/store'
import { useLockers } from '../lockers/store'
import { getSemesterStatus } from '../lockers/types'
import HomeBannerListPage from './HomeBannerListPage'
import StatusBadgeDropdown from '../../components/common/StatusBadgeDropdown'

type HomeItem = { id: string; title: string; description: string; visible: boolean }

function HomeSectionSettings() {
  const { events } = useEvents()
  const { semesters } = useLockers()
  const today = new Date().toISOString().slice(0, 10)
  const [items, setItems] = useState<HomeItem[]>(() => [
    ...events.filter((event) => event.isPublic && event.openDate <= today && event.deadline >= today).map((event) => ({ id: `event-${event.id}`, title: event.title, description: `${event.openDate} ~ ${event.deadline} · 진행 중인 행사`, visible: true })),
    ...semesters.filter((semester) => getSemesterStatus(semester) === '진행중').map((semester) => ({ id: `locker-${semester.id}`, title: `${semester.year}-${semester.term}학기 사물함 신청`, description: `${semester.applyStartDate} ~ ${semester.applyEndDate} · 신청 기간`, visible: true })),
  ])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const reorder = (draggedId: string, targetId: string) => setItems((prev) => {
    const from = prev.findIndex((item) => item.id === draggedId)
    const to = prev.findIndex((item) => item.id === targetId)
    if (from < 0 || to < 0 || from === to) return prev
    const next = [...prev]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  })
  const handleDrop = (event: DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault()
    const draggedId = event.dataTransfer.getData('text/plain')
    if (draggedId) reorder(draggedId, targetId)
    setDraggingId(null)
    setDragOverId(null)
  }
  return <FlexBox flexDirection="column" style={{ gap: 16 }}>
    <Typography variant="body2" color="semantic.label.alternative">현재 진행 중인 행사와 사물함 신청 기간만 홈 화면 섹션 후보로 표시됩니다. 노출 여부와 순서를 설정하세요.</Typography>
    {items.length === 0 ? <FlexBox alignItems="center" justifyContent="center" style={{ minHeight: 180, border: '1px dashed var(--semantic-line-normal-normal)', borderRadius: 16 }}><Typography variant="body2" color="semantic.label.alternative">현재 노출할 행사 또는 사물함 신청 기간이 없어요.</Typography></FlexBox> : <Table className="data-table"><TableHead><TableRow><TableHeadCell style={{ width: 40 }} /><TableHeadCell style={{ width: 60 }}>순서</TableHeadCell><TableHeadCell>제목</TableHeadCell><TableHeadCell style={{ width: 220 }}>신청 기간</TableHeadCell><TableHeadCell style={{ width: 100 }}>상태</TableHeadCell></TableRow></TableHead><TableBody>
      {items.map((item, index) => <TableRow key={item.id} onDragOver={(event) => { event.preventDefault(); setDragOverId(item.id) }} onDragLeave={() => setDragOverId((current) => current === item.id ? null : current)} onDrop={(event) => handleDrop(event, item.id)} style={{ background: dragOverId === item.id && draggingId !== item.id ? 'var(--semantic-fill-normal)' : undefined }}>
        <TableCell><FlexBox draggable onDragStart={(event) => { event.dataTransfer.setData('text/plain', item.id); event.dataTransfer.effectAllowed = 'move'; setDraggingId(item.id) }} onDragEnd={() => { setDraggingId(null); setDragOverId(null) }} alignItems="center" justifyContent="center" style={{ cursor: 'grab', width: 24, height: 24 }}><IconMenu width={16} height={16} style={{ color: 'var(--semantic-label-alternative)' }} /></FlexBox></TableCell><TableCell><Typography variant="body2">{index + 1}</Typography></TableCell><TableCell><Typography variant="body1" weight="medium">{item.title}</Typography></TableCell><TableCell><Typography variant="body2" color="semantic.label.alternative">{item.description.split(' · ')[0]}</Typography></TableCell><TableCell><StatusBadgeDropdown value={item.visible ? 'visible' : 'hidden'} options={[{ value: 'visible', label: '노출', tone: 'positive' }, { value: 'hidden', label: '미노출', tone: 'neutral' }]} onChange={(value) => setItems((previous) => previous.map((current) => current.id === item.id ? { ...current, visible: value === 'visible' } : current))} /></TableCell>
      </TableRow>)}
    </TableBody></Table>}
  </FlexBox>
}

export default function HomeManagementPage() {
  const [tab, setTab] = useState('banner')
  return <><PageHeader title="홈 화면 관리" description="홈 배너와 홈 화면 행사 섹션의 노출을 관리해요." /><Tab value={tab} onValueChange={setTab}><TabList size="medium" style={{ marginBottom: 24 }}><TabListItem value="banner">홈 배너 관리</TabListItem><TabListItem value="sections">홈 행사 노출 설정</TabListItem></TabList><TabPanel value="banner"><HomeBannerListPage /></TabPanel><TabPanel value="sections"><HomeSectionSettings /></TabPanel></Tab></>
}
