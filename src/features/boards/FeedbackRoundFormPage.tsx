import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Checkbox, FlexBox, TextArea, Typography, useToast } from '@wanteddev/wds'
import PageHeader from '../../components/common/PageHeader'
import BoldMarkupText from '../../components/common/BoldMarkupText'
import { useBoards } from './store'
import type { FeedbackAnswer } from './types'

type AnswerDraft = {
  answerText: string
}

function FeedbackRoundFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { questions, feedbackRounds, addFeedbackRound, updateFeedbackRound } = useBoards()
  const toast = useToast()

  const existing = id ? feedbackRounds.find((round) => round.id === id) : undefined
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>(() => {
    const initial: Record<string, AnswerDraft> = {}
    existing?.answers.forEach((answer) => {
      initial[answer.questionId] = { answerText: answer.answerText }
    })
    return initial
  })
  const [error, setError] = useState<string>()

  const goToList = () => navigate('/feedback?tab=questions')

  const toggleQuestion = (questionId: string, checked: boolean) => {
    setAnswers((prev) => {
      const next = { ...prev }
      if (checked) next[questionId] = next[questionId] ?? { answerText: '' }
      else delete next[questionId]
      return next
    })
  }

  const updateAnswer = (questionId: string, patch: Partial<AnswerDraft>) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }))
  }

  const handleSubmit = () => {
    const entries = Object.entries(answers)
    if (entries.length === 0) {
      setError('답변할 질문을 하나 이상 선택해주세요.')
      return
    }
    if (entries.some(([, draft]) => !draft.answerText.trim())) {
      setError('선택한 질문에는 모두 답변을 입력해주세요.')
      return
    }
    setError(undefined)

    const payload: FeedbackAnswer[] = entries.map(([questionId, draft]) => ({
      questionId,
      answerText: draft.answerText,
    }))

    if (isEdit && id) {
      updateFeedbackRound(id, payload)
      toast({ content: '피드백 회차가 수정되었어요.', variant: 'positive' })
    } else {
      addFeedbackRound(payload)
      toast({ content: '새 피드백 회차가 등록되었어요.', variant: 'positive' })
    }
    goToList()
  }

  return (
    <>
      <PageHeader
        title={isEdit ? '피드백 회차 수정' : 'N차 피드백 등록'}
        description="사용자 질문 목록에서 답변할 질문을 선택하고 답변을 작성하세요. **텍스트**로 감싸면 굵게 표시돼요."
      />

      {error && (
        <Typography variant="label2" color="semantic.status.negative" style={{ marginBottom: 12 }}>
          {error}
        </Typography>
      )}

      <FlexBox flexDirection="column" style={{ gap: 16, maxWidth: 720 }}>
        {questions.map((question) => {
          const checked = question.id in answers
          const draft = answers[question.id]
          return (
            <FlexBox
              key={question.id}
              flexDirection="column"
              style={{
                gap: 10,
                padding: 16,
                borderRadius: 12,
                border: '1px solid var(--semantic-line-normal-normal)',
              }}
            >
              <FlexBox as="label" alignItems="flex-start" style={{ gap: 8, cursor: 'pointer' }}>
                <Checkbox
                  checked={checked}
                  onCheckedChange={(state) => toggleQuestion(question.id, state)}
                  style={{ marginTop: 2 }}
                />
                <FlexBox flexDirection="column" style={{ gap: 2 }}>
                  <Typography variant="body1" weight="medium">
                    {question.content}
                  </Typography>
                  <Typography variant="caption1" color="semantic.label.alternative">
                    {question.studentName} · {question.createdAt}
                  </Typography>
                </FlexBox>
              </FlexBox>

              {checked && draft && (
                <FlexBox flexDirection="column" style={{ gap: 10, paddingLeft: 28 }}>
                  <TextArea
                    placeholder="답변을 입력하세요. **굵게** 표시 가능"
                    value={draft.answerText}
                    width="100%"
                    minRows={2}
                    onChange={(e) => updateAnswer(question.id, { answerText: e.target.value })}
                  />
                  {draft.answerText && (
                    <Typography variant="body2" color="semantic.label.alternative">
                      미리보기: <BoldMarkupText text={draft.answerText} />
                    </Typography>
                  )}
                </FlexBox>
              )}
            </FlexBox>
          )
        })}

        <FlexBox justifyContent="flex-end" style={{ gap: 8 }}>
          <Button variant="solid" color="primary" onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
          <Button variant="outlined" color="assistive" onClick={goToList}>
            취소
          </Button>
        </FlexBox>
      </FlexBox>
    </>
  )
}

export default FeedbackRoundFormPage
