import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, DatePicker, FlexBox, IconButton, Menu, MenuContent, MenuItem, MenuList, MenuTrigger, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Tab, TabList, TabListItem, TabPanel, TextField, Typography, useToast } from '@wanteddev/wds'
import { IconChevronLeft, IconChevronRight, IconMoreVertical, IconTrash } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import FormItem from '../../components/common/FormItem'
import ImageUploadField from '../../components/common/ImageUploadField'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'

type CalendarEvent = { id: string; startDate: string; endDate: string; title: string }
type Poster = { id: string; title: string; image: string; isActive: boolean }

const weekDays = ['일', '월', '화', '수', '목', '금', '토']
const isoDate = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
const toDateValue = (value: Date | string | null | undefined) => {
  if (!value) return ''
  if (value instanceof Date) return isoDate(value.getFullYear(), value.getMonth(), value.getDate())
  return value.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? value
}

function DisplayManagementPage() {
  const toast = useToast()
  const today = new Date()
  const [tab, setTab] = useState('calendar')
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'cal_1', startDate: '2026-09-10', endDate: '2026-09-10', title: '26-2 개강파티' },
    { id: 'sports', startDate: '2026-09-15', endDate: '2026-09-19', title: '체육대회 신청기간' },
    { id: 'cal_2', startDate: '2026-10-05', endDate: '2026-10-05', title: '중간고사 시작' },
    { id: 'cal_3', startDate: '2026-10-05', endDate: '2026-10-07', title: '학생회 간담회' },
    { id: 'cal_4', startDate: '2026-10-12', endDate: '2026-10-16', title: '수강신청 변경 기간' },
  ])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [posters, setPosters] = useState<Poster[]>([])
  const [posterModalOpen, setPosterModalOpen] = useState(false)
  const [posterTitle, setPosterTitle] = useState('')
  const [posterImage, setPosterImage] = useState<string[]>([])
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null)
  const [deletePosterTarget, setDeletePosterTarget] = useState<Poster | null>(null)
  const [posterStatusTarget, setPosterStatusTarget] = useState<Poster | null>(null)
  const [openPosterMenuId, setOpenPosterMenuId] = useState<string | null>(null)
  const [deleteEventTarget, setDeleteEventTarget] = useState<CalendarEvent | null>(null)
  const [eventErrors, setEventErrors] = useState<Record<string, string>>({})
  const [posterErrors, setPosterErrors] = useState<Record<string, string>>({})
  const eventTitleRef = useRef<HTMLInputElement>(null)
  const eventStartRef = useRef<HTMLInputElement>(null)
  const eventEndRef = useRef<HTMLInputElement>(null)
  const posterTitleRef = useRef<HTMLInputElement>(null)
  const posterImageRef = useRef<HTMLDivElement>(null)
  useEffect(() => { setEventErrors({}) }, [selectedDate, editingEventId])
  useEffect(() => { setPosterErrors({}) }, [posterModalOpen, editingPoster])

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
    setSelectedDate(date)
    setEditingEventId(null); setEventTitle(''); setEventStartDate(date); setEventEndDate(date); setEventFormOpen(false)
  }
  const saveEvent = () => {
    if (!selectedDate) return
    const errors: Record<string, string> = {}
    if (!eventTitle.trim()) errors.title = '일정명을 입력해주세요.'
    if (!eventStartDate || !eventEndDate) errors.period = '시작일과 종료일을 모두 입력해주세요.'
    else if (eventEndDate < eventStartDate) errors.period = '종료일은 시작일 이후로 선택해주세요.'
    setEventErrors(errors)
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => (errors.title ? eventTitleRef : !eventStartDate ? eventStartRef : eventEndRef).current?.focus())
      return
    }
    if (editingEventId) setEvents((prev) => prev.map((event) => event.id === editingEventId ? { ...event, title: eventTitle.trim(), startDate: eventStartDate, endDate: eventEndDate } : event))
    else setEvents((prev) => [...prev, { id: `cal_${Date.now()}`, startDate: eventStartDate, endDate: eventEndDate, title: eventTitle.trim() }])
    setSelectedDate(null)
    setEventFormOpen(false)
    toast({ content: '일정을 저장했어요.', variant: 'positive' })
  }
  const deleteEvent = () => {
    if (!deleteEventTarget) return
    setEvents((prev) => prev.filter((event) => event.id !== deleteEventTarget.id))
    setDeleteEventTarget(null)
    setSelectedDate(null)
    toast({ content: '일정을 삭제했어요.', variant: 'positive' })
  }
  const savePoster = () => {
    const errors: Record<string, string> = {}
    if (!posterImage[0]) errors.image = '포스터 이미지를 업로드해주세요.'
    if (!posterTitle.trim()) errors.title = '포스터명을 입력해주세요.'
    setPosterErrors(errors)
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => { if (errors.image) posterImageRef.current?.focus(); else posterTitleRef.current?.focus() })
      return
    }
    setPosters((prev) => editingPoster ? prev.map((poster) => poster.id === editingPoster.id ? { ...poster, title: posterTitle.trim(), image: posterImage[0] } : poster) : [{ id: `poster_${Date.now()}`, title: posterTitle.trim(), image: posterImage[0], isActive: true }, ...prev])
    setPosterModalOpen(false)
    setPosterTitle('')
    setPosterImage([])
    setEditingPoster(null)
    toast({ content: editingPoster ? '행사 포스터를 수정했어요.' : '행사 포스터를 추가했어요.', variant: 'positive' })
  }

  return (
    <>
      <PageHeader title="디스플레이 관리" description="학사 일정과 행사 포스터를 관리해요." />
      <Tab value={tab} onValueChange={setTab}>
        <TabList size="medium" style={{ marginBottom: 32 }}>
          <TabListItem value="calendar">학사 캘린더</TabListItem>
          <TabListItem value="poster">행사 포스터</TabListItem>
        </TabList>
        <TabPanel value="calendar">
          <FlexBox className="display-calendar-toolbar" justifyContent="space-between" alignItems="center" style={{ marginBottom: 24, gap: 12 }}>
            <FlexBox className="display-calendar-navigation" alignItems="center" style={{ gap: 16 }}>
              <IconButton variant="outlined" size="medium" aria-label="이전 달" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><IconChevronLeft width={22} height={22} /></IconButton>
              <Typography className="display-calendar-month" variant="heading2" weight="bold">{year}년 {monthIndex + 1}월</Typography>
              <IconButton variant="outlined" size="medium" aria-label="다음 달" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><IconChevronRight width={22} height={22} /></IconButton>
            </FlexBox>
            <Typography className="display-calendar-help" variant="body2" color="semantic.label.alternative">날짜를 눌러 일정을 관리하세요.</Typography>
          </FlexBox>
          <div className="display-calendar-frame" style={{ border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 16, overflowX: 'auto' }}>
            <div className="display-calendar-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--semantic-line-normal-normal)' }}>
              {weekDays.map((day, index) => <FlexBox className="display-calendar-weekday" key={day} justifyContent="center"><Typography variant="body1" weight="bold" style={{ color: index === 0 ? 'var(--semantic-status-negative)' : index === 6 ? 'var(--semantic-primary-normal)' : undefined }}>{day}</Typography></FlexBox>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
              {cells.map((day, index) => {
                const date = day ? isoDate(year, monthIndex, day) : ''
                const dateEvents = events.filter((event) => event.startDate <= date && event.endDate >= date)
                return <button className={`display-calendar-day${day ? ' app-hoverable app-hoverable-flat' : ''}`} key={`${date}-${index}`} type="button" onClick={() => day && openDate(day)} style={{ position: 'relative', overflow: 'hidden', border: 'none', borderRight: index % 7 === 6 ? 'none' : '1px solid var(--semantic-line-normal-normal)', borderBottom: index < cells.length - 7 ? '1px solid var(--semantic-line-normal-normal)' : 'none', background: day ? 'var(--semantic-background-normal-normal)' : 'var(--semantic-background-normal-alternative)', padding: 0, textAlign: 'left', cursor: day ? 'pointer' : 'default' }}>
                  {day && <>
                    <Typography className="display-calendar-date" variant="body1" weight="medium">{day}</Typography>
                    <div className="display-calendar-events">
                      {dateEvents.slice(0, 2).map((event) => <span className="display-calendar-event" key={event.id}>{event.title}</span>)}
                      {dateEvents.length > 2 && <Typography className="display-calendar-more" variant="caption1" color="semantic.primary.normal">+{dateEvents.length - 2}개 더보기</Typography>}
                    </div>
                  </>}
                </button>
              })}
            </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel value="poster">
          <FlexBox className="display-poster-toolbar" justifyContent="space-between" alignItems="center" style={{ marginBottom: 28, gap: 12 }}>
            <Typography variant="body1" color="semantic.label.alternative">총 {posters.length}개 / 활성화 {posters.filter((poster) => poster.isActive).length}개</Typography>
            <Button variant="solid" color="primary" onClick={() => { setEditingPoster(null); setPosterTitle(''); setPosterImage([]); setPosterModalOpen(true) }}>+ 포스터 추가하기</Button>
          </FlexBox>
          {posters.length === 0 ? (
            <EmptyState message="등록된 포스터가 없어요." description="포스터를 추가하면 여기에 표시돼요." style={{ minHeight: 220 }} />
          ) : <div className="display-poster-grid">{posters.map((poster) => <div key={poster.id} className={`display-poster-card${poster.isActive ? '' : ' display-poster-card--inactive'}`}>
            <img src={poster.image} alt={poster.title} className="display-poster-card-image" />
            <div className="display-poster-card-status"><StatusBadge label={poster.isActive ? '활성화' : '비활성화'} tone={poster.isActive ? 'positive' : 'neutral'} leadingContent={<span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: poster.isActive ? 'var(--semantic-status-positive)' : 'var(--semantic-label-alternative)', display: 'inline-block' }} />} style={poster.isActive ? { background: '#E6F8EC' } : undefined} /></div>
            <Menu open={openPosterMenuId === poster.id} onOpenChange={(open) => setOpenPosterMenuId(open ? poster.id : null)}>
              <MenuTrigger><IconButton className="display-poster-card-menu" variant="normal" size="small" aria-label={`${poster.title} 더보기`}><IconMoreVertical width={20} height={20} /></IconButton></MenuTrigger>
              <MenuContent position="bottom-end" offset={6}><MenuList>
                <MenuItem value="toggle" onClick={() => { setPosterStatusTarget(poster); setOpenPosterMenuId(null) }}>{poster.isActive ? '비활성화' : '활성화'}</MenuItem>
                <MenuItem value="edit" onClick={() => { setEditingPoster(poster); setPosterTitle(poster.title); setPosterImage([poster.image]); setPosterModalOpen(true); setOpenPosterMenuId(null) }}>수정</MenuItem>
                <MenuItem value="delete" style={{ color: 'var(--semantic-status-negative)' }} onClick={() => { setDeletePosterTarget(poster); setOpenPosterMenuId(null) }}>삭제</MenuItem>
              </MenuList></MenuContent>
            </Menu>
            <div className="display-poster-card-title"><Typography variant="body1" weight="bold">{poster.title}</Typography></div>
          </div>)}</div>}
        </TabPanel>
      </Tab>
      <Modal open={Boolean(selectedDate)} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <ModalContainer size="medium"><ModalContent>
          <ModalContentItem><ModalHeading>{selectedDate?.replaceAll('-', '. ')} 일정 편집</ModalHeading></ModalContentItem>
          <ModalContentItem style={{ gap: 14 }}>
            {events.filter((event) => event.startDate <= (selectedDate ?? '') && event.endDate >= (selectedDate ?? '')).map((event) => {
              const isEditing = editingEventId === event.id
              return <button key={event.id} className="app-hoverable" type="button" aria-pressed={isEditing} onClick={() => { setEditingEventId(event.id); setEventTitle(event.title); setEventStartDate(event.startDate); setEventEndDate(event.endDate); setEventFormOpen(true) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', border: isEditing ? '1px solid var(--semantic-primary-normal)' : '1px solid transparent', background: isEditing ? 'var(--semantic-primary-light)' : 'var(--semantic-fill-normal)', borderRadius: 8, padding: '9px 12px', color: 'var(--semantic-label-normal)', textAlign: 'left', cursor: 'pointer', fontSize: 14, lineHeight: 1.4 }}><span>{event.title}</span>{isEditing && <span style={{ flexShrink: 0, padding: '2px 6px', borderRadius: 999, background: 'var(--semantic-primary-normal)', color: '#fff', fontSize: 11, fontWeight: 600 }}>수정 중</span>}</button>
            })}
            {!eventFormOpen && <Button variant="outlined" color="primary" onClick={() => { setEditingEventId(null); setEventTitle(''); setEventStartDate(selectedDate ?? ''); setEventEndDate(selectedDate ?? ''); setEventFormOpen(true) }}>＋ 일정 추가</Button>}
            {eventFormOpen && <FlexBox flexDirection="column" style={{ gap: 16, paddingTop: 8 }}>
              <FormItem label="일정명" required error={eventErrors.title}><TextField ref={eventTitleRef} invalid={Boolean(eventErrors.title)} value={eventTitle} placeholder="일정을 입력해주세요" onChange={(event) => setEventTitle(event.target.value)} /></FormItem>
              <FormItem label="일정 기간" required error={eventErrors.period}><FlexBox className="app-date-range" alignItems="center" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 8, width: '100%' }}><DatePicker inputRef={eventStartRef} aria-label="일정 시작일" invalid={Boolean(eventErrors.period)} value={eventStartDate} width="100%" onChange={(value) => setEventStartDate(toDateValue(value))} /><Typography className="app-date-range-separator" variant="body2" color="semantic.label.alternative">~</Typography><DatePicker inputRef={eventEndRef} aria-label="일정 종료일" invalid={Boolean(eventErrors.period)} value={eventEndDate} width="100%" onChange={(value) => setEventEndDate(toDateValue(value))} /></FlexBox></FormItem>
            </FlexBox>}
          </ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Button variant="outlined" color="assistive" style={{ visibility: eventFormOpen && editingEventId ? 'visible' : 'hidden', color: 'var(--semantic-status-negative)' }} onClick={() => setDeleteEventTarget(events.find((event) => event.id === editingEventId) ?? null)}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconTrash width={16} height={16} style={{ display: 'block' }} />삭제</span></Button><FlexBox style={{ gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setSelectedDate(null)}>취소</Button><Button variant="solid" color="primary" disabled={!eventFormOpen} onClick={saveEvent}>저장</Button></FlexBox></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
      <ConfirmModal open={Boolean(deletePosterTarget)} onOpenChange={(open) => !open && setDeletePosterTarget(null)} title="포스터를 삭제할까요?" description={deletePosterTarget ? `"${deletePosterTarget.title}" 포스터를 삭제해요.` : undefined} confirmLabel="삭제" tone="negative" onConfirm={() => { if (!deletePosterTarget) return; setPosters((prev) => prev.filter((poster) => poster.id !== deletePosterTarget.id)); setDeletePosterTarget(null); toast({ content: '포스터를 삭제했어요.', variant: 'positive' }) }} />
      <ConfirmModal open={Boolean(posterStatusTarget)} onOpenChange={(open) => !open && setPosterStatusTarget(null)} title={posterStatusTarget?.isActive ? '포스터를 비활성화할까요?' : '포스터를 활성화할까요?'} description={posterStatusTarget ? `"${posterStatusTarget.title}" 포스터를 ${posterStatusTarget.isActive ? '비활성화' : '활성화'}해요.` : undefined} confirmLabel={posterStatusTarget?.isActive ? '비활성화' : '활성화'} onConfirm={() => { if (!posterStatusTarget) return; const nextIsActive = !posterStatusTarget.isActive; setPosters((prev) => prev.map((poster) => poster.id === posterStatusTarget.id ? { ...poster, isActive: nextIsActive } : poster)); setPosterStatusTarget(null); toast({ content: `포스터를 ${nextIsActive ? '활성화' : '비활성화'}했어요.`, variant: 'positive' }) }} />
      <ConfirmModal open={Boolean(deleteEventTarget)} onOpenChange={(open) => !open && setDeleteEventTarget(null)} title="일정을 삭제할까요?" description={deleteEventTarget ? `“${deleteEventTarget.title}” 일정을 삭제해요.` : undefined} confirmLabel="삭제" tone="negative" onConfirm={deleteEvent} />
      <Modal open={posterModalOpen} onOpenChange={setPosterModalOpen}>
        <ModalContainer size="small"><ModalContent>
          <ModalContentItem><ModalHeading>행사 포스터 {editingPoster ? '수정' : '추가'}</ModalHeading></ModalContentItem>
          <ModalContentItem style={{ gap: 20 }}><FormItem label="포스터" required error={posterErrors.image}><div ref={posterImageRef} tabIndex={-1} role="group" aria-label="포스터 이미지" aria-invalid={Boolean(posterErrors.image)}><ImageUploadField value={posterImage} onChange={setPosterImage} maxCount={1} previewSize={160} /></div></FormItem><FormItem label="포스터명" required error={posterErrors.title}><TextField ref={posterTitleRef} invalid={Boolean(posterErrors.title)} value={posterTitle} onChange={(event) => setPosterTitle(event.target.value)} /></FormItem></ModalContentItem>
          <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="outlined" color="assistive" onClick={() => setPosterModalOpen(false)}>취소</Button><Button variant="solid" color="primary" onClick={savePoster}>{editingPoster ? '수정 완료' : '추가하기'}</Button></ModalContentItem>
        </ModalContent></ModalContainer>
      </Modal>
    </>
  )
}

export default DisplayManagementPage
