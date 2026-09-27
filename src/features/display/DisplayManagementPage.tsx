import { useMemo, useState } from 'react'
import { Button, FlexBox, IconButton, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Tab, TabList, TabListItem, TabPanel, TextField, Typography, useToast } from '@wanteddev/wds'
import { IconChevronLeft, IconChevronRight, IconImage, IconTrash } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'

type CalendarEvent = { id: string; date: string; title: string }
type Poster = { id: string; title: string; image: string }

const weekDays = ['일', '월', '화', '수', '목', '금', '토']
const isoDate = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

function DisplayManagementPage() {
  const toast = useToast()
  const today = new Date()
  const [tab, setTab] = useState('calendar')
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'cal_1', date: '2026-09-10', title: '26-2 개강파티' },
    ...[15, 16, 17, 18, 19].map((day) => ({ id: `sports_${day}`, date: `2026-09-${day}`, title: '체육대회 신청기간' })),
  ])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [posters, setPosters] = useState<Poster[]>([])
  const [posterModalOpen, setPosterModalOpen] = useState(false)
  const [posterTitle, setPosterTitle] = useState('')
  const [posterImage, setPosterImage] = useState<string[]>([])

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const cells = useMemo(() => {
    const startDay = new Date(year, monthIndex, 1).getDay()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const count = Math.ceil((startDay + daysInMonth) / 7) * 7
    return Array.from({ length: count }, (_, index) => {
      const day = index - startDay + 1
      return day > 0 && day <= daysInMonth ? day : null
    })
  }, [year, monthIndex])

  const openDate = (day: number) => {
    const date = isoDate(year, monthIndex, day)
    const existing = events.find((event) => event.date === date)
    setSelectedDate(date)
    setEditingEventId(existing?.id ?? null)
    setEventTitle(existing?.title ?? '')
  }
  const saveEvent = () => {
    if (!selectedDate || !eventTitle.trim()) return
    if (editingEventId) setEvents((prev) => prev.map((event) => event.id === editingEventId ? { ...event, title: eventTitle.trim() } : event))
    else setEvents((prev) => [...prev, { id: `cal_${Date.now()}`, date: selectedDate, title: eventTitle.trim() }])
    setSelectedDate(null)
    toast({ content: '일정을 저장했어요.', variant: 'positive' })
  }
  const deleteEvent = () => {
    if (!editingEventId) return
    setEvents((prev) => prev.filter((event) => event.id !== editingEventId))
    setSelectedDate(null)
    toast({ content: '일정을 삭제했어요.', variant: 'positive' })
  }
  const savePoster = () => {
    if (!posterTitle.trim() || !posterImage[0]) return
    setPosters((prev) => [...prev, { id: `poster_${Date.now()}`, title: posterTitle.trim(), image: posterImage[0] }])
    setPosterModalOpen(false)
    setPosterTitle('')
    setPosterImage([])
    toast({ content: '행사 포스터를 추가했어요.', variant: 'positive' })
  }

  return (
    <>
      <PageHeader title="디스플레이 관리" description="디스플레이에 노출할 학사 일정과 행사 포스터를 관리해요." />
      <Tab value={tab} onValueChange={setTab}>
        <TabList size="medium" style={{ marginBottom: 32 }}>
          <TabListItem value="calendar">학사 캘린더</TabListItem>
          <TabListItem value="poster">행사 포스터</TabListItem>
        </TabList>
        <TabPanel value="calendar">
          <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 24 }}>
            <FlexBox alignItems="center" style={{ gap: 16 }}>
              <IconButton variant="outlined" size="medium" aria-label="이전 달" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><IconChevronLeft width={22} height={22} /></IconButton>
              <Typography variant="heading2" weight="bold">{year}년 {monthIndex + 1}월</Typography>
              <IconButton variant="outlined" size="medium" aria-label="다음 달" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><IconChevronRight width={22} height={22} /></IconButton>
            </FlexBox>
            <Typography variant="body2" color="semantic.label.alternative">날짜를 클릭하여 일정을 추가·수정하세요.</Typography>
          </FlexBox>
          <div style={{ border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--semantic-line-normal-normal)' }}>
              {weekDays.map((day, index) => <FlexBox key={day} justifyContent="center" style={{ padding: '18px 0' }}><Typography variant="body1" weight="bold" style={{ color: index === 0 ? 'var(--semantic-status-negative)' : index === 6 ? 'var(--semantic-primary-normal)' : undefined }}>{day}</Typography></FlexBox>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
              {cells.map((day, index) => {
                const date = day ? isoDate(year, monthIndex, day) : ''
                const dateEvents = events.filter((event) => event.date === date)
                const previousDate = cells[index - 1] ? isoDate(year, monthIndex, cells[index - 1]!) : ''
                const continuesFromPrevious = (event: CalendarEvent) => events.some((item) => item.date === previousDate && item.title === event.title)
                const spanLength = (event: CalendarEvent) => {
                  let length = 1
                  let cursor = index
                  while (cursor % 7 !== 6) {
                    const followingDay = cells[cursor + 1]
                    if (!followingDay) break
                    const followingDate = isoDate(year, monthIndex, followingDay)
                    if (!events.some((item) => item.date === followingDate && item.title === event.title)) break
                    length += 1
                    cursor += 1
                  }
                  return length
                }
                const hasScheduleStart = dateEvents.some((event) => !continuesFromPrevious(event))
                return <button className={day ? 'app-hoverable app-hoverable-flat' : undefined} key={`${date}-${index}`} type="button" onClick={() => day && openDate(day)} style={{ position: 'relative', zIndex: hasScheduleStart ? 2 : 0, minHeight: 132, border: 'none', borderRight: index % 7 === 6 ? 'none' : '1px solid var(--semantic-line-normal-normal)', borderBottom: index < cells.length - 7 ? '1px solid var(--semantic-line-normal-normal)' : 'none', background: day ? 'var(--semantic-background-normal-normal)' : 'var(--semantic-background-normal-alternative)', padding: 0, textAlign: 'left', cursor: day ? 'pointer' : 'default' }}>
                  {day && <>
                    <Typography variant="body1" weight="medium" style={{ position: 'absolute', top: 14, left: 14, display: 'block', textAlign: 'left', zIndex: 1 }}>{day}</Typography>
                    <FlexBox flexDirection="column" style={{ position: 'absolute', zIndex: 3, top: 52, left: 8, right: 8, gap: 6, pointerEvents: 'none' }}>
                      {dateEvents.map((event) => {
                        if (continuesFromPrevious(event)) return null
                        const length = spanLength(event)
                        return <span key={event.id} style={{ position: 'relative', zIndex: 3, display: 'block', width: `calc(${length * 100}% + ${(length - 1) * 16}px)`, minHeight: 30, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRadius: 6, padding: '6px 10px', background: 'var(--semantic-primary-normal)', color: '#fff', fontSize: 14, textAlign: 'center' }}>{event.title}</span>
                      })}
                    </FlexBox>
                  </>}
                </button>
              })}
            </div>
          </div>
        </TabPanel>
        <TabPanel value="poster">
          <FlexBox justifyContent="space-between" alignItems="center" style={{ marginBottom: 28 }}>
            <Typography variant="body1" color="semantic.label.alternative">총 {posters.length}개 / 활성화 {posters.length}개</Typography>
            <Button variant="solid" color="primary" onClick={() => setPosterModalOpen(true)}>+ 포스터 추가하기</Button>
          </FlexBox>
          {posters.length === 0 ? (
            <FlexBox flexDirection="column" alignItems="center" justifyContent="center" style={{ minHeight: 400, gap: 16, border: '1px dashed var(--semantic-line-normal-normal)', borderRadius: 16 }}><IconImage width={56} height={56} style={{ color: 'var(--semantic-label-alternative)' }} /><Typography variant="title3" color="semantic.label.alternative">등록된 포스터가 없습니다.</Typography></FlexBox>
          ) : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>{posters.map((poster) => <FlexBox key={poster.id} flexDirection="column" style={{ gap: 8 }}><img src={poster.image} alt={poster.title} style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 12 }} /><Typography variant="body1" weight="medium">{poster.title}</Typography></FlexBox>)}</div>}
        </TabPanel>
      </Tab>
      <Modal open={Boolean(selectedDate)} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>{selectedDate?.replaceAll('-', '. ')} 일정 {editingEventId ? '수정' : '추가'}</ModalHeading></ModalContentItem>
          <ModalContentItem><FormItem label="일정명"><TextField value={eventTitle} placeholder="일정을 입력해주세요" onChange={(event) => setEventTitle(event.target.value)} /></FormItem></ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Button variant="outlined" color="assistive" style={{ visibility: editingEventId ? 'visible' : 'hidden', color: 'var(--semantic-status-negative)' }} onClick={deleteEvent}><IconTrash width={16} height={16} />삭제</Button><FlexBox style={{ gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setSelectedDate(null)}>취소</Button><Button variant="solid" color="primary" onClick={saveEvent}>저장</Button></FlexBox></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
      <Modal open={posterModalOpen} onOpenChange={setPosterModalOpen}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>행사 포스터 추가</ModalHeading></ModalContentItem>
          <ModalContentItem style={{ gap: 20 }}><FormItem label="포스터"><ImageUploadField value={posterImage} onChange={setPosterImage} maxCount={1} previewSize={160} /></FormItem><FormItem label="포스터명"><TextField value={posterTitle} onChange={(event) => setPosterTitle(event.target.value)} /></FormItem></ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setPosterModalOpen(false)}>취소</Button><Button variant="solid" color="primary" onClick={savePoster}>추가하기</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
    </>
  )
}

export default DisplayManagementPage
