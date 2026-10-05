import { useState } from 'react'
import { Checkbox, FlexBox, Tab, TabList, TabListItem, TabPanel, Typography } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import { useEvents } from '../events/store'
import { useLockers } from '../lockers/store'
import { getSemesterStatus } from '../lockers/types'
import HomeBannerListPage from './HomeBannerListPage'

type HomeItem = { id: string; title: string; description: string; visible: boolean }

function HomeSectionSettings() {
  const { events } = useEvents()
  const { semesters } = useLockers()
  const today = new Date().toISOString().slice(0, 10)
  const [items, setItems] = useState<HomeItem[]>(() => [
    ...events.filter((event) => event.isPublic && event.openDate <= today && event.deadline >= today).map((event) => ({ id: `event-${event.id}`, title: event.title, description: `${event.openDate} ~ ${event.deadline} · 진행 중인 행사`, visible: true })),
    ...semesters.filter((semester) => getSemesterStatus(semester) === '진행중').map((semester) => ({ id: `locker-${semester.id}`, title: `${semester.year}-${semester.term}학기 사물함 신청`, description: `${semester.applyStartDate} ~ ${semester.applyEndDate} · 신청 기간`, visible: true })),
  ])
  const move = (id: string, direction: -1 | 1) => setItems((prev) => {
    const index = prev.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= prev.length) return prev
    const next = [...prev]
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
  })
  return <FlexBox flexDirection="column" style={{ gap: 16 }}>
    <Typography variant="body2" color="semantic.label.alternative">현재 진행 중인 행사와 사물함 신청 기간만 홈 화면 섹션 후보로 표시됩니다. 노출 여부와 순서를 설정하세요.</Typography>
    {items.length === 0 ? <FlexBox alignItems="center" justifyContent="center" style={{ minHeight: 180, border: '1px dashed var(--semantic-line-normal-normal)', borderRadius: 16 }}><Typography variant="body2" color="semantic.label.alternative">현재 노출할 행사 또는 사물함 신청 기간이 없어요.</Typography></FlexBox> : <FlexBox flexDirection="column" style={{ border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16, overflow: 'hidden' }}>
      {items.map((item, index) => <FlexBox key={item.id} alignItems="center" justifyContent="space-between" style={{ padding: 20, gap: 16, borderBottom: index < items.length - 1 ? '1px solid var(--semantic-line-normal-normal)' : undefined }}>
        <FlexBox alignItems="center" style={{ gap: 16 }}><Typography variant="body2" color="semantic.label.alternative" style={{ width: 24 }}>{index + 1}</Typography><FlexBox flexDirection="column" style={{ gap: 3 }}><Typography variant="body1" weight="medium">{item.title}</Typography><Typography variant="caption1" color="semantic.label.alternative">{item.description}</Typography></FlexBox></FlexBox>
        <FlexBox alignItems="center" style={{ gap: 14 }}><button type="button" disabled={index === 0} onClick={() => move(item.id, -1)} style={{ border: 0, background: 'transparent', cursor: index === 0 ? 'default' : 'pointer', color: 'var(--semantic-label-normal)' }}>↑</button><button type="button" disabled={index === items.length - 1} onClick={() => move(item.id, 1)} style={{ border: 0, background: 'transparent', cursor: index === items.length - 1 ? 'default' : 'pointer', color: 'var(--semantic-label-normal)' }}>↓</button><Checkbox checked={item.visible} onCheckedChange={(checked) => setItems((prev) => prev.map((current) => current.id === item.id ? { ...current, visible: Boolean(checked) } : current))}>노출</Checkbox></FlexBox>
      </FlexBox>)}
    </FlexBox>}
  </FlexBox>
}

export default function HomeManagementPage() {
  const [tab, setTab] = useState('banner')
  return <><PageHeader title="홈 화면 관리" description="홈 배너와 홈 화면 행사 섹션의 노출을 관리해요." /><Tab value={tab} onValueChange={setTab}><TabList size="medium" style={{ marginBottom: 24 }}><TabListItem value="banner">홈 배너 관리</TabListItem><TabListItem value="sections">홈 행사 노출 설정</TabListItem></TabList><TabPanel value="banner"><HomeBannerListPage /></TabPanel><TabPanel value="sections"><HomeSectionSettings /></TabPanel></Tab></>
}
