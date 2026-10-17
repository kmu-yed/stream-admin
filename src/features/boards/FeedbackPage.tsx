import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, FlexBox, IconButton, Modal, ModalContainer, ModalContent, ModalContentItem, ModalHeading, Tab, TabList, TabListItem, TabPanel, Typography } from '@wanteddev/wds'
import { IconChevronLeft, IconChevronRight } from '@wanteddev/wds-icon'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import SearchField from '../../components/common/SearchField'
import { useBoards } from './store'
import type { FeedbackQuestion, FeedbackRound, FeedbackRoundStatus } from './types'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import BoldMarkupText from '../../components/common/BoldMarkupText'
import EmptyState from '../../components/common/EmptyState'
import TableCheckboxFilter from '../../components/common/TableCheckboxFilter'
import { getFeedbackRoundStatus } from './feedbackRoundStatus'

const roundTone: Record<FeedbackRoundStatus, BadgeTone> = { 오픈예정: 'neutral', 질문접수중: 'info', 답변작성중: 'cautionary', 회차종료: 'positive' }

function Summary() { const { feedbackRounds, answerDrafts, questions } = useBoards(); const current = [...feedbackRounds].sort((a, b) => b.roundNumber - a.roundNumber).find((round) => ['질문접수중', '답변작성중'].includes(getFeedbackRoundStatus(round, answerDrafts))); return <div className="feedback-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>{[['진행 중 회차', current ? `${current.roundNumber}차 열린 피드백` : '진행 중인 회차 없음'], ['질문 접수 기간', current ? `${current.openDate} ~ ${current.closeDate}` : '-'], ['접수 질문 수', `${questions.length}건`]].map(([label, value]) => <FlexBox key={label} flexDirection="column" style={{ gap: 6, padding: 18, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 12 }}><Typography variant="caption1" color="semantic.label.alternative">{label}</Typography><Typography variant="body1" weight="bold">{value}</Typography></FlexBox>)}</div> }

function RoundsPanel() {
  const navigate = useNavigate()
  const { feedbackRounds, answerDrafts, questions } = useBoards()
  const [selectedRound, setSelectedRound] = useState<FeedbackRound | null>(null)
  const [answerIndex, setAnswerIndex] = useState(0)
  const [statusFilters, setStatusFilters] = useState<string[]>(['all'])
  const openRoundAnswers = (round: FeedbackRound) => { setSelectedRound(round); setAnswerIndex(0) }
  const columns: DataTableColumn<FeedbackRound>[] = [
    { key: 'round', header: '회차', width: 100, render: (row) => `${row.roundNumber}차` },
    { key: 'period', header: '질문 접수 기간', render: (row) => `${row.openDate} ~ ${row.closeDate}` },
    { key: 'questions', header: '답변 수', width: 100, render: (row) => `${row.answers.length}건` },
    { key: 'status', header: <TableCheckboxFilter label="상태" ariaLabel="회차 상태 필터" options={['오픈예정', '질문접수중', '답변작성중', '회차종료']} value={statusFilters} onChange={setStatusFilters} />, width: 180, render: (row) => { const status = getFeedbackRoundStatus(row, answerDrafts); return <StatusBadge label={status} tone={roundTone[status]} /> } },
    { key: 'view', header: '', width: 132, align: 'right', render: (row) => <Button variant="outlined" size="small" aria-label={`${row.roundNumber}차 답변 내역 보기`} onClick={() => openRoundAnswers(row)} style={{ color: 'var(--semantic-primary-normal)', borderColor: 'var(--semantic-line-normal-normal)', whiteSpace: 'nowrap' }}>회차 답변 보기</Button> },
  ]
  return <>
    <FlexBox justifyContent="flex-end" style={{ marginBottom: 16 }}><Button variant="solid" color="primary" onClick={() => navigate('/feedback/rounds/new')}>+ 새 회차 등록</Button></FlexBox>
    <DataTable columns={columns} rows={feedbackRounds.filter((round) => statusFilters.includes('all') || statusFilters.includes(getFeedbackRoundStatus(round, answerDrafts))).sort((a, b) => b.roundNumber - a.roundNumber)} rowKey={(row) => row.id} emptyMessage={feedbackRounds.length === 0 ? '등록된 회차가 없어요.' : '조건에 맞는 회차가 없어요.'} emptyDescription={feedbackRounds.length > 0 ? '상태 필터를 변경해 보세요.' : undefined} showRowNumber={false} />
    <Modal open={Boolean(selectedRound)} onOpenChange={(open) => !open && setSelectedRound(null)}>
      <ModalContainer size="large"><ModalContent>
        <ModalContentItem><ModalHeading>{selectedRound ? `${selectedRound.roundNumber}차 답변 내역` : '답변 내역'}</ModalHeading></ModalContentItem>
        <ModalContentItem style={{ gap: 16 }}>
          {!selectedRound?.answers.length ? <EmptyState message="등록된 답변이 없어요." variant="compact" /> : (() => {
            const answer = selectedRound.answers[answerIndex]
            const question = questions.find((item) => item.id === answer.questionId)
            const progress = ((answerIndex + 1) / selectedRound.answers.length) * 100
            return <FlexBox flexDirection="column" style={{ gap: 16 }}>
              <FlexBox justifyContent="space-between" alignItems="center"><Typography variant="label2" color="semantic.label.alternative">{answerIndex + 1} / {selectedRound.answers.length}</Typography><Typography variant="caption1" color="semantic.label.alternative">답변 진행</Typography></FlexBox>
              <div style={{ height: 6, borderRadius: 99, background: 'var(--semantic-fill-normal)', overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', borderRadius: 99, background: 'var(--semantic-primary-normal)', transition: 'width .2s ease' }} /></div>
              <FlexBox flexDirection="column" style={{ gap: 10, minHeight: 180, padding: 20, border: '1px solid var(--semantic-line-normal-normal)', borderRadius: 12 }}><Typography variant="body1" weight="bold">{question?.content ?? '삭제된 질문'}</Typography><Typography variant="body2"><BoldMarkupText text={answer.answerText} /></Typography></FlexBox>
              <FlexBox justifyContent="space-between"><IconButton variant="outlined" size="medium" aria-label="이전 답변" disabled={answerIndex === 0} onClick={() => setAnswerIndex((index) => index - 1)}><IconChevronLeft /></IconButton><IconButton variant="outlined" size="medium" aria-label="다음 답변" disabled={answerIndex === selectedRound.answers.length - 1} onClick={() => setAnswerIndex((index) => index + 1)}><IconChevronRight /></IconButton></FlexBox>
            </FlexBox>
          })()}
        </ModalContentItem>
        <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end' }}><Button variant="outlined" color="assistive" onClick={() => setSelectedRound(null)}>닫기</Button></ModalContentItem>
      </ModalContent></ModalContainer>
    </Modal>
  </>
}

function QuestionsPanel() {
  const navigate = useNavigate()
  const { questions } = useBoards()
  const [search, setSearch] = useState('')
  const filtered = questions.filter((question) =>
    !search.trim() || question.content.includes(search.trim()) || question.studentName.includes(search.trim()),
  )
  const columns: DataTableColumn<FeedbackQuestion>[] = [
    { key: 'content', header: '질문', render: (row) => <span title={row.content} style={{ display: 'block', width: '100%', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.content}</span> },
    { key: 'student', header: '작성자', width: 100, render: (row) => row.studentName },
    { key: 'date', header: '등록일', width: 120, render: (row) => row.createdAt },
  ]
  return <>
    <FlexBox className="app-page-toolbar" justifyContent="flex-end" style={{ gap: 12, marginBottom: 16 }}>
      <SearchField value={search} onChange={setSearch} placeholder="질문 또는 작성자 검색" />
      <Button variant="solid" color="primary" size="medium" onClick={() => navigate('/feedback/answers/new')}>+ 피드백 답변 등록</Button>
    </FlexBox>
    <DataTable columns={columns} rows={filtered} rowKey={(row) => row.id} className="feedback-questions-table" minWidth={620} emptyMessage={questions.length === 0 ? '등록된 질문이 없어요.' : '조건에 맞는 질문이 없어요.'} emptyDescription={questions.length > 0 ? '검색어를 변경해 보세요.' : undefined} />
  </>
}

export default function FeedbackPage() { const [params, setParams] = useSearchParams(); const tab = params.get('tab') ?? 'questions'; return <><PageHeader title="열린피드백 관리" description="회차를 열고 질문을 접수한 뒤 답변을 작성·공개하는 흐름을 관리해요." /><Summary /><Tab value={tab} onValueChange={(value) => setParams({ tab: value })}><TabList size="medium" style={{ marginBottom: 20 }}><TabListItem value="questions">현재 회차 질문</TabListItem><TabListItem value="rounds">회차 관리</TabListItem></TabList><TabPanel value="questions"><QuestionsPanel /></TabPanel><TabPanel value="rounds"><RoundsPanel /></TabPanel></Tab></> }
