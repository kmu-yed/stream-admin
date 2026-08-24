import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button,
  FlexBox,
  Modal,
  ModalContainer,
  ModalContent,
  ModalContentItem,
  ModalHeading,
  Tab,
  TabList,
  TabListItem,
  TabPanel,
  Typography,
} from '@wanteddev/wds'
import type { ThemeColorsToken } from '@wanteddev/wds-engine'
import PageHeader from '../../components/common/PageHeader'
import DataTable, { type DataTableColumn } from '../../components/common/DataTable'
import StatusBadge, { type BadgeTone } from '../../components/common/StatusBadge'
import BoldMarkupText from '../../components/common/BoldMarkupText'
import ConfirmModal from '../../components/common/ConfirmModal'
import RowActionButton from '../../components/common/RowActionButton'
import { useBoards } from './store'
import type { FeedbackAnswer, FeedbackQuestion, FeedbackQuestionStatus, FeedbackRound } from './types'

const questionStatusTone: Record<FeedbackQuestionStatus, BadgeTone> = {
  답변완료: 'positive',
  대기: 'cautionary',
}

function QuestionsPanel() {
  const { questions } = useBoards()

  const columns: DataTableColumn<FeedbackQuestion>[] = [
    { key: 'content', header: '질문', render: (row) => row.content },
    { key: 'studentName', header: '작성자', width: 100, render: (row) => row.studentName },
    { key: 'createdAt', header: '작성일', width: 120, render: (row) => row.createdAt },
    {
      key: 'status',
      header: '답변 상태',
      width: 110,
      render: (row) => <StatusBadge label={row.status} tone={questionStatusTone[row.status]} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={questions}
      rowKey={(row) => row.id}
      emptyMessage="등록된 질문이 없어요."
    />
  )
}

function RoundsPanel() {
  const navigate = useNavigate()
  const { questions, feedbackRounds, deleteFeedbackRound } = useBoards()
  const [deleteTarget, setDeleteTarget] = useState<FeedbackRound | null>(null)

  const sortedRounds = [...feedbackRounds].sort((a, b) => b.roundNumber - a.roundNumber)
  const latestRound = sortedRounds[0]
  const pastRounds = sortedRounds.slice(1)

  const roundColumns: DataTableColumn<FeedbackRound>[] = [
    { key: 'roundNumber', header: '회차', width: 100, render: (row) => `${row.roundNumber}차` },
    { key: 'createdAt', header: '등록일', width: 120, render: (row) => row.createdAt },
    { key: 'count', header: '포함 질문', width: 100, render: (row) => `${row.answers.length}건` },
    {
      key: 'actions',
      header: '',
      width: 140,
      align: 'right',
      render: (row) => (
        <FlexBox alignItems="center" justifyContent="flex-end" style={{ gap: 16 }}>
          <RowActionButton onClick={() => navigate(`/feedback/rounds/${row.id}/edit`)}>수정</RowActionButton>
          <RowActionButton danger onClick={() => setDeleteTarget(row)}>
            삭제
          </RowActionButton>
        </FlexBox>
      ),
    },
  ]

  return (
    <FlexBox flexDirection="column" style={{ gap: 24 }}>
      <FlexBox justifyContent="flex-end">
        <Button variant="solid" color="primary" onClick={() => navigate('/feedback/rounds/new')}>
          + N차 피드백 등록
        </Button>
      </FlexBox>

      {latestRound ? (
        <FlexBox
          flexDirection="column"
          style={{
            gap: 12,
            padding: 20,
            borderRadius: 12,
            background: 'rgba(var(--semantic-primary-normal-rgb), 0.06)',
            border: '1px solid rgba(var(--semantic-primary-normal-rgb), 0.16)',
          }}
        >
          <FlexBox justifyContent="space-between" alignItems="center">
            <Typography variant="title3" weight="bold" color="semantic.primary.normal">
              최신 회차 · {latestRound.roundNumber}차 ({latestRound.createdAt})
            </Typography>
            <FlexBox alignItems="center" style={{ gap: 16 }}>
              <RowActionButton onClick={() => navigate(`/feedback/rounds/${latestRound.id}/edit`)}>
                수정
              </RowActionButton>
              <RowActionButton danger onClick={() => setDeleteTarget(latestRound)}>
                삭제
              </RowActionButton>
            </FlexBox>
          </FlexBox>
          <FlexBox flexDirection="column" style={{ gap: 10 }}>
            {latestRound.answers.map((answer) => {
              const question = questions.find((q) => q.id === answer.questionId)
              return (
                <FlexBox key={answer.questionId} flexDirection="column" style={{ gap: 4 }}>
                  <FlexBox alignItems="center" style={{ gap: 6 }}>
                    <StatusBadge label={answer.category} tone="neutral" />
                    <Typography variant="label1" weight="medium">
                      Q. {question?.content ?? '(삭제된 질문)'}
                    </Typography>
                  </FlexBox>
                  <Typography variant="body2" color="semantic.label.alternative">
                    A. <BoldMarkupText text={answer.answerText} />
                  </Typography>
                </FlexBox>
              )
            })}
          </FlexBox>
        </FlexBox>
      ) : (
        <Typography variant="body2" color="semantic.label.alternative">
          등록된 피드백 회차가 없어요.
        </Typography>
      )}

      {pastRounds.length > 0 && (
        <FlexBox flexDirection="column" style={{ gap: 12 }}>
          <Typography variant="label1" weight="bold">
            지난 피드백
          </Typography>
          <DataTable columns={roundColumns} rows={pastRounds} rowKey={(row) => row.id} />
        </FlexBox>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="피드백 회차를 삭제할까요?"
        description={deleteTarget ? `${deleteTarget.roundNumber}차 피드백 모아보기를 삭제해요.` : undefined}
        confirmLabel="삭제"
        tone="negative"
        onConfirm={() => {
          if (deleteTarget) deleteFeedbackRound(deleteTarget.id)
        }}
      />
    </FlexBox>
  )
}

type FlatAnswer = {
  round: FeedbackRound
  answer: FeedbackAnswer
  question?: FeedbackQuestion
}

function TruncatedText({
  text,
  variant,
  weight,
  color,
  maxWidth,
}: {
  text: string
  variant: 'body1' | 'body2'
  weight?: 'regular' | 'medium'
  color?: ThemeColorsToken
  maxWidth: number
}) {
  return (
    <Typography
      variant={variant}
      weight={weight}
      color={color}
      style={{
        display: 'block',
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {text.replace(/\*\*/g, '')}
    </Typography>
  )
}

function AllFeedbackPanel() {
  const { questions, feedbackRounds } = useBoards()
  const [selected, setSelected] = useState<FlatAnswer | null>(null)

  const flatAnswers: FlatAnswer[] = [...feedbackRounds]
    .sort((a, b) => b.roundNumber - a.roundNumber)
    .flatMap((round) =>
      round.answers.map((answer) => ({
        round,
        answer,
        question: questions.find((q) => q.id === answer.questionId),
      })),
    )

  const columns: DataTableColumn<FlatAnswer>[] = [
    {
      key: 'round',
      header: '회차',
      width: 80,
      render: ({ round }) => <StatusBadge label={`${round.roundNumber}차`} tone="info" />,
    },
    {
      key: 'category',
      header: '카테고리',
      width: 100,
      render: ({ answer }) => <StatusBadge label={answer.category} tone="neutral" />,
    },
    {
      key: 'answeredAt',
      header: '답변일시',
      width: 140,
      render: ({ round }) => <span style={{ whiteSpace: 'nowrap' }}>{round.createdAt}</span>,
    },
    {
      key: 'question',
      header: 'Q',
      render: ({ question }) => (
        <TruncatedText
          text={question?.content ?? '(삭제된 질문)'}
          variant="body1"
          weight="medium"
          maxWidth={280}
        />
      ),
    },
    {
      key: 'answer',
      header: 'A',
      render: ({ answer }) => <TruncatedText text={answer.answerText} variant="body1" weight="medium" maxWidth={320} />,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={flatAnswers}
        rowKey={({ round, answer }) => `${round.id}_${answer.questionId}`}
        emptyMessage="답변한 피드백이 없어요."
        onRowClick={setSelected}
      />

      <Modal open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <ModalContainer size="medium">
          <ModalContent>
            <ModalContentItem style={{ gap: 8 }}>
              <FlexBox alignItems="center" style={{ gap: 6 }}>
                {selected && <StatusBadge label={`${selected.round.roundNumber}차`} tone="info" />}
                {selected && <StatusBadge label={selected.answer.category} tone="neutral" />}
                <Typography variant="caption1" color="semantic.label.alternative">
                  {selected?.round.createdAt}
                </Typography>
              </FlexBox>
              <ModalHeading>Q. {selected?.question?.content ?? '(삭제된 질문)'}</ModalHeading>
            </ModalContentItem>
            <ModalContentItem>
              <Typography variant="body1" color="semantic.label.normal">
                A. {selected && <BoldMarkupText text={selected.answer.answerText} />}
              </Typography>
            </ModalContentItem>
            <ModalContentItem style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="assistive" onClick={() => setSelected(null)}>
                닫기
              </Button>
            </ModalContentItem>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  )
}

function FeedbackPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'questions'

  return (
    <>
      <PageHeader title="열린피드백 관리" description="사용자 질문에 답변하고 피드백을 관리해요." />

      <Tab value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabList size="medium" style={{ marginBottom: 20 }}>
          <TabListItem value="questions">사용자 질문</TabListItem>
          <TabListItem value="rounds">N차 피드백 모아보기</TabListItem>
          <TabListItem value="all">전체 피드백</TabListItem>
        </TabList>

        <TabPanel value="questions">
          <QuestionsPanel />
        </TabPanel>
        <TabPanel value="rounds">
          <RoundsPanel />
        </TabPanel>
        <TabPanel value="all">
          <AllFeedbackPanel />
        </TabPanel>
      </Tab>
    </>
  )
}

export default FeedbackPage
